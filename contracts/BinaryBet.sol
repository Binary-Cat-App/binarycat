pragma solidity ^0.6.8;
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./BinToken.sol";
import "./BinStaking.sol";

//SPDX-License-Identifier: UNLICENSED
contract BinaryBet {
    using SafeMath for uint256;
    // IERC20 private bin;

    uint fee;

    address payable owner;
    mapping(uint => int) ethPrice;


    enum BetSide {down, up} 
    enum BetResult {down, up, tie}

    struct Pool {
        uint startingBlock;
        uint referenceBlock;
        uint settlementBlock;

        uint upValue;
        uint downValue;
    }

    Pool firstWindow;
    uint windowDuration; //in block

    mapping (uint => Pool) pools; //windowNumber => Pool

 

    struct Stake {
        uint upStake;
        uint downStake;
    }
    


    mapping (address => uint) balance;
    mapping (address => mapping(uint => Stake)) userStake;
    mapping (address => mapping(uint => bool)) userBetted;

    mapping (address => uint[]) userWindows;
    event newBet(uint value, uint8 side, address user, uint windowNumber);
    event newDeposit(uint value, address user);
    event newWithdraw(uint value, address user);
    event betSettled(uint gain, uint windowNumber, address user);
    
    bool stakingSet = false;
    address payable stakingAddress;
    function setStakingAddress(address stakingContract) external {
        require(!stakingSet);
        stakingAddress = payable(stakingContract);
        stakingSet = true;
    }

    
    constructor(uint _firstWindowBlock, uint _windowDuration, uint _fee) public {
        require(_fee <= 100);
        //
        //                  |-------------betting window-----------|--------------settlement period-----------|  
        //         firstWindowBlock                      starting block                         starting block



        //                                                         +                                          +            
        //                                                     window size                               2*window size 
        //                                                         =                                          = 
        //                                                  referenceBlock                          settlementBlock

        firstWindow = Pool(_firstWindowBlock, _firstWindowBlock.add(_windowDuration), _firstWindowBlock.add(_windowDuration.mul(2)), 0,0);
        windowDuration = _windowDuration;
        pools[0] = firstWindow;
        
        fee = _fee;
        owner = msg.sender;

    }



    function deposit() payable external {
        balance[msg.sender] = balance[msg.sender].add(msg.value);
        emit newDeposit(msg.value, msg.sender);
    }

    function withdraw(uint value) external {
        uint gain = updateBalance(msg.sender);
        balance[msg.sender] = balance[msg.sender].add(gain);

        require(value <= balance[msg.sender], "not enough funds");
        balance[msg.sender] = balance[msg.sender].sub(value);
        msg.sender.transfer(value);
        
        emit newWithdraw(value, msg.sender);

    }
    
    function placeBet (uint betValue, uint8 side) payable external {
        uint windowNumber = getBlockWindow(block.number);

        uint gain = updateBalance(msg.sender);
        balance[msg.sender] = balance[msg.sender].add(gain);
        require(!userBetted[msg.sender][windowNumber], "user can only bet one time per window"); //First user bet on the window.
        require(betValue <= balance[msg.sender].add(msg.value), "not enough money to place this bet");

        //betValue <= balance + msg.value
        //0 <= balance + msg.value - betValue
        balance[msg.sender] = balance[msg.sender].add(msg.value).sub(betValue);
        uint betFee = computeFee(betValue, fee); 
        
        BinaryStaking staking = BinaryStaking(stakingAddress); 
        staking.receiveFunds.value(betFee)();

        uint value = betValue.sub(betFee);
        userWindows[msg.sender].push(windowNumber);

        updatePool (windowNumber, value, uint8(side));
        updateStake(msg.sender, uint8(side), windowNumber, value);
        userBetted[msg.sender][windowNumber] = true;
        emit newBet(value, side, msg.sender, windowNumber);
    }       

    function updateBalance(address user) public returns(uint){
        uint totalGain = 0;
        uint[] storage userWindowsList = userWindows[user];
        if(userWindowsList.length == 0) {
            return 0;
        }
        for (uint i = userWindowsList.length-1; i >= 0; i--) {
            Pool memory pool = pools[userWindowsList[i]];
            if(block.number < pool.settlementBlock) {
                continue;
            }

            int referencePrice =  ethPrice[pool.referenceBlock];
            int settlementPrice = ethPrice[pool.settlementBlock];
            Stake storage stake = userStake[user][userWindowsList[i]];
            uint8 result = betResult(referencePrice, settlementPrice);
            uint windowGain = settleBet(stake.upStake, stake.downStake, pool.downValue, pool.upValue, result);

            stake.downStake = 0;
            stake.upStake = 0;
            totalGain = totalGain.add(windowGain);
            emit betSettled(windowGain, userWindowsList[i], user);

            userWindowsList[i] = userWindowsList[userWindowsList.length -1];
            userWindowsList.pop();
        }
        return totalGain;
    }

    function settleBet(uint upStake, uint downStake, uint poolUp, uint poolDown, uint8 betResult) public pure returns (uint) {
        BetResult result = BetResult(betResult);
        uint poolTotal = poolUp.add(poolDown);
        uint gain = 0;
        if (result == BetResult.up) {
            gain = (upStake*poolTotal)/poolUp;
        } 
        else if (result == BetResult.down) {
            gain = (downStake*poolTotal)/poolDown;
        }
        else {
            gain = upStake.add(downStake);
        }
        
        return gain;
    }

   function betResult(int referencePrice, int settlementPrice) public pure returns(uint8){            
        if(settlementPrice < referencePrice) {
            return 0;
        }   
        else if(settlementPrice > referencePrice) {
            return 1;
        } 
        else {
            return 2;
        }
    }
 
    
    //Internal but set as public for testing
    function updateStake(address user, uint8 side, uint windowNumber, uint value) public{
        BetSide betSide = BetSide(side);
        if (betSide == BetSide.down) {
            Stake storage stake = userStake[user][windowNumber]; 
            stake.downStake = stake.downStake.add(value); 
        }
        if (betSide == BetSide.up) {
            Stake storage stake = userStake[user][windowNumber]; 
            stake.upStake = stake.upStake.add(value);
        }
        
    }

    //Internal but set as public for testing
    function updatePool (uint windowNumber, uint value, uint8 betSide) public {
        uint startingBlock = getWindowStartingBlock(windowNumber);
        if (pools[windowNumber].settlementBlock == 0) {
            //
            //                  |-------------betting window-----------|--------------settlement period-----------|  
            //          starting block                      starting block                         starting block
            //                                                         +                                          +
            //                                                     window size                               2*window size          
            
            pools[windowNumber].referenceBlock = startingBlock.add(windowDuration);
            pools[windowNumber].settlementBlock = startingBlock.add(windowDuration.mul(2));
             
        }

        BetSide side = BetSide(betSide);
        if (side == BetSide.down) { //down
              pools[windowNumber].downValue = pools[windowNumber].downValue.add(value);
        }
        
        if (side == BetSide.up) {
              pools[windowNumber].upValue = pools[windowNumber].upValue.add(value);
        }
        

    }  

    //Internal but set as public for testing
    function getBlockWindow (uint currentBlock) public view returns (uint windowNumber) {
        //n = floor((beg block - first_block)/window_size  + 1)
        windowNumber = ((currentBlock.sub(pools[0].startingBlock)).div(windowDuration)).add(1); //integer division => floor    
    }

    //Internal but set as public for testing
    function getWindowStartingBlock (uint windowNumber) public view returns (uint startingBlock) {
        //firstBlock + (n-1)*window_size
        startingBlock =  pools[0].startingBlock.add((windowNumber.sub(1)).mul(windowDuration));
    }

    function computeFee(uint value, uint _fee) public pure returns (uint betFee) {
        betFee = (value.mul(_fee)).div(100); 

    }


    function getBlockPrice(uint block) internal returns (int){
        if(ethPrice[block] == 0) {
            ethPrice[block] = priceOracle(block);
        }
        return ethPrice[block];
    }
    
    //TODO Implement price API
    function priceOracle(uint block) internal returns (int currentPrice){
        return 100;
    }

    //Getters
    function getPoolValues(uint windowNumber) public view returns (uint, uint, uint, uint) {
        Pool memory pool = pools[windowNumber];
        return (pool.settlementBlock, pool.downValue, pool.upValue, pool.referenceBlock);
    }

    function getUserStake(uint windowNumber, address user) public view returns (uint, uint) {
        Stake  memory stake  = userStake[user][windowNumber];
        return (stake.downStake, stake.upStake);
    }
    function getBalance(address user) public view returns(uint) {
        return balance[user];
    }
    


}

