pragma solidity ^0.6.8;
import "@openzeppelin/contracts/math/SafeMath.sol";

//SPDX-License-Identifier: UNLICENSED
contract BinaryBet {
    using SafeMath for uint256;

    BettingWindow firstWindow;
    uint bettingWindowTotalSize;
    uint blocksForBetting;

    uint fee;
    address payable owner;
    mapping(uint => uint) ethPrice;
    enum BetSide {down, up} 

    enum BetResult {down, up, tie}
 
    struct Pool {
        uint settlementBlock;
        uint upValue;
        uint downValue;
        uint referencePrice;
    }
    
    struct BettingWindow {
        uint startingBlock;
        Pool windowPool;
    }

    struct Stake {
        uint upStake;
        uint downStake;
    }
    
    mapping (uint => BettingWindow) windows; //windowNumber => window


    mapping (address => uint) balance;
    mapping (address => mapping(uint => Stake)) userStake;
    mapping (address => uint[]) userWindows;
    

    
    constructor(uint _firstWindowBlock, uint _bettingWindowTotalSize, uint _blocksForBetting, uint _fee) public{
        require(_fee <= 100);
        firstWindow = BettingWindow(_firstWindowBlock, Pool(_firstWindowBlock.add(_bettingWindowTotalSize), 0,0, getBlockPrice(block.number))) ;
        blocksForBetting = _blocksForBetting;
        bettingWindowTotalSize = _bettingWindowTotalSize;
        windows[0] = firstWindow;
        
        fee = _fee;
        owner = msg.sender;
    }

    function deposit() payable external {
        balance[msg.sender] = balance[msg.sender].add(msg.value);
    }

    function withdraw(uint value) external {
        uint gain = updateBalance(msg.sender, userWindows[msg.sender]);
        balance[msg.sender] = balance[msg.sender].add(gain);

        uint funds = balance[msg.sender];
        require(value <= funds, "not enough funds");
        balance[msg.sender] = balance[msg.sender].sub(value);
        msg.sender.transfer(value);

    }
    
    function placeBet (uint betValue, BetSide side) payable external {
        uint windowNumber = getBlockWindow(block.number);
        uint startingBlock = getWindowStartingBlock(windowNumber);
        uint lastBetBlock = getWindowLastBettingBlock(startingBlock);
        
        uint gain = updateBalance(msg.sender, userWindows[msg.sender]);
        balance[msg.sender] = balance[msg.sender].add(gain);

        require(block.number <= lastBetBlock, "bets closed for this window");
        require(betValue <= balance[msg.sender].add(msg.value), "not enough money to place this bet");

        balance[msg.sender] = balance[msg.sender].sub(betValue);
        uint betFee = computeFee(betValue, fee); 
        owner.transfer(betFee);

        uint value = betValue.sub(betFee);
        userWindows[msg.sender].push(windowNumber);

        if(windows[windowNumber].windowPool.settlementBlock != 0) { //window exists (cant remember the best way to check this)
            updatePool (windowNumber, value, uint8(side));
        }

        else {
            createPool (windowNumber, startingBlock, value, uint8(side));
        }
        updateStake(msg.sender, uint8(side), windowNumber, value);
    }       

        function updateBalance(address user, uint[] memory _userWindowsList) public returns(uint){
        uint totalGain = 0;
        uint[] storage userWindowsList = userWindows[user];
        for (uint i = userWindowsList.length; i >= 0; i--) {
            Pool memory pool = windows[userWindowsList[i]].windowPool;
            if(block.number < pool.settlementBlock) {
                continue;
            }
            else {
                uint referencePrice = pool.referencePrice;
                uint settlementPrice = getBlockPrice(pool.settlementBlock);
                Stake storage stake = userStake[user][userWindowsList[i]];
                uint8 result = betResult(referencePrice, settlementPrice);
                uint windowGain = settleBet(stake.upStake, stake.downStake, pool.downValue, pool.upValue, result);

                stake.downStake = 0;
                stake.upStake = 0;
                totalGain = totalGain.add(windowGain);
                delete userWindowsList[i];
            }
        }
        return totalGain;
    }

    function settleBet(uint upStake, uint downStake, uint poolUp, uint poolDown, uint8 betResult) public pure returns (uint gain) {
        BetResult result = BetResult(betResult);
        uint poolTotal = poolUp + poolDown;
        if (result == BetResult.up) {
            gain = (upStake.div(poolUp)).mul(poolTotal);
        } 
        else if (result == BetResult.down) {
            gain = (downStake.div(poolDown)).mul(poolTotal);
        }
        else {
            gain = upStake.add(downStake);
        }
        return gain;
    }

   function betResult(uint referencePrice, uint settlementPrice) public pure returns(uint8){            
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
 
    
    function updateStake(address user, uint8 side, uint windowNumber, uint value) internal{
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
        BetSide side = BetSide(betSide);
        if (side == BetSide.down) { //down
              windows[windowNumber].windowPool.downValue = windows[windowNumber].windowPool.downValue.add(value);
        }
        
        if (side == BetSide.up) {
              windows[windowNumber].windowPool.upValue = windows[windowNumber].windowPool.upValue.add(value);
        }
        

    }

    //Internal but set as public for testing
    function createPool (uint windowNumber, uint startingBlock, uint value, uint8 betSide) public {
            require(windows[windowNumber].windowPool.settlementBlock == 0, "pool already exists");
            BetSide side = BetSide(betSide);
            if (side == BetSide.down) { //down
              Pool memory newPool = Pool(startingBlock.add(bettingWindowTotalSize), 0, value, getBlockPrice(startingBlock));
              windows[windowNumber] = BettingWindow(startingBlock, newPool);
             }
             
             else  { //up
              Pool memory newPool = Pool(startingBlock.add(bettingWindowTotalSize), value, 0, getBlockPrice(startingBlock));
              windows[windowNumber] = BettingWindow(startingBlock, newPool);
             }  
    }
    

    //Internal but set as public for testing
    function getBlockWindow (uint currentBlock) public view returns (uint windowNumber) {
        //n = floor((beg block - first_block)/window_size  + 1)
        windowNumber = ((currentBlock.sub(windows[0].startingBlock)).div(bettingWindowTotalSize)).add(1); //integer division => floor    
    }

    //Internal but set as public for testing
    function getWindowStartingBlock (uint windowNumber) public view returns (uint startingBlock) {
        //firstBlock + (n-1)*window_size
        startingBlock =  windows[0].startingBlock.add((windowNumber.sub(1)).mul(bettingWindowTotalSize));
    }
    
    //Internal but set as public for testing
    function getWindowLastBettingBlock (uint startingBlock) public view returns (uint lastBettingBlock) {
        return startingBlock.add(blocksForBetting);
    }


    function getPoolValues(uint windowNumber) public view returns (uint, uint, uint, uint) {
        Pool memory pool = windows[windowNumber].windowPool;
        return (pool.settlementBlock, pool.downValue, pool.upValue, pool.referencePrice);
    }

    function computeFee(uint value, uint _fee) public pure returns (uint betFee) {
        betFee = (value.mul(_fee)).div(100); 

    }


    function getBlockPrice(uint blockNumber) internal returns (uint){
        if(ethPrice[blockNumber] == 0) {
            ethPrice[blockNumber] = priceOracle(blockNumber);
        }
        return ethPrice[blockNumber];
    }
    
    //TODO Implement price API
    function priceOracle(uint blockNumber) internal returns (uint currentPrice){
        return 100;
    }



}

