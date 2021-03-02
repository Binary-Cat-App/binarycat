pragma solidity ^0.6.8;
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./BinToken.sol";
import "./BinStaking.sol";

//SPDX-License-Identifier: UNLICENSED
contract BinaryBet {
    using SafeMath for uint256;

    //Structs and enums
    enum BetSide {down, up} 

    enum BetResult {down, up, tie}

    struct Pool {
        uint startingBlock;
        uint referenceBlock;
        uint settlementBlock;

        uint upValue;
        uint downValue;
    }

    struct Stake {
        uint upStake;
        uint downStake;
    }

    //Betting parameters
    address governance;
    uint public fee;
    uint public windowDuration; //in blocks
    uint public firstBlock;
    BinaryStaking staking; 

    //Window management
    mapping (uint => Pool) public pools; //windowNumber => Pool
    mapping(uint => int) public  windowPrice; //first price collection at the window.
    uint public firstWindow = 1;
    uint public windowOffset;
    uint accumulatedFees;

    //User variables

    mapping (address => uint) public balance;
    mapping (address => mapping(uint => Stake)) public  userStake;
    mapping (address => mapping(uint => bool)) userBetted;
    mapping (address => uint) lastBet;

    //EVENTS
    event newBet(uint value, uint8 side, address user, uint windowNumber);
    event newDeposit(uint value, address user);
    event newWithdraw(uint value, address user);
    event betSettled(uint gain, uint windowNumber, address user);

    
    modifier onlyGovernance() {
        require(msg.sender == governance, "only governance can call this method");
        _;
    }

    function changeGovernance(address newGovernance) onlyGovernance public{
        governance = newGovernance;
    }

    function changeWindowSize(uint windowSize) onlyGovernance public {
        require(windowSize > 0, "window size should be strictly positive");
        uint currentWindow = getBlockWindow(block.number, windowDuration, firstBlock, windowOffset, firstWindow);
        firstBlock = getWindowStartingBlock(currentWindow.add(1), windowDuration, firstBlock, windowOffset);
        windowOffset = currentWindow;
        firstWindow = currentWindow;
        windowDuration = windowSize;
    }


    bool stakingSet = false;
    address payable stakingAddress;
    function setStakingAddress(address stakingContract) external {
        require(!stakingSet);
        stakingAddress = payable(stakingContract);
        stakingSet = true;
        staking = BinaryStaking(stakingAddress); 
    }


    constructor(uint _firstWindowBlock, uint _windowDuration, uint _fee) public {
        require(_fee <= 100);
        firstBlock = _firstWindowBlock;
        windowDuration = _windowDuration;

        fee = _fee;
        governance = msg.sender;
        firstWindow = 1;
    }


    function deposit() payable external {
        updatePrice();
        balance[msg.sender] = balance[msg.sender].add(msg.value);
        emit newDeposit(msg.value, msg.sender);
    }

    function withdraw(uint value) external {
        updatePrice();
        uint gain = updateBalance(msg.sender);
        balance[msg.sender] = balance[msg.sender].add(gain);

        require(value <= balance[msg.sender], "not enough funds");
        balance[msg.sender] = balance[msg.sender].sub(value);
        msg.sender.transfer(value);

        emit newWithdraw(value, msg.sender);

    }

    function placeBet (uint betValue, uint8 side) payable external {
        updatePrice();
        uint windowNumber = getBlockWindow(block.number, windowDuration, firstBlock, windowOffset, firstWindow);


        uint gain = updateBalance(msg.sender);
        balance[msg.sender] = balance[msg.sender].add(gain);
        require(!userBetted[msg.sender][windowNumber], "user can only bet one time per window"); //First user bet on the window.
        require(betValue <= balance[msg.sender].add(msg.value), "not enough money to place this bet");

        //betValue <= balance + msg.value
        //0 <= balance + msg.value - betValue
        balance[msg.sender] = balance[msg.sender].add(msg.value).sub(betValue);

        uint betFee = computeFee(betValue, fee); 
        accumulatedFees = accumulatedFees.add(betFee);
        
        uint value = betValue.sub(betFee);
        lastBet[msg.sender] = windowNumber;

        updatePool (windowNumber, value, uint8(side));
        updateStake(msg.sender, uint8(side), windowNumber, value);
        userBetted[msg.sender][windowNumber] = true;
        emit newBet(value, side, msg.sender, windowNumber);
    }

    function updateBalance(address user) public returns(uint){
        if(lastBet[user] == 0) {
            return 0;
        }

        uint window = lastBet[user];
        lastBet[user] = 0;
        Pool memory pool = pools[window];
        if(block.number < pool.settlementBlock) {
            return 0;
        }

if(accumulatedFees > 0) {
            staking.receiveFunds.value(accumulatedFees)();
            accumulatedFees = 0;

        }

        (int referencePrice, int settlementPrice) = getWindowBetPrices(window);
        Stake storage stake = userStake[user][window];
        uint8 result = betResult(referencePrice, settlementPrice);
        uint windowGain = settleBet(stake.upStake, stake.downStake, pool.downValue, pool.upValue, result);

        stake.downStake = 0;
        stake.upStake = 0;
        emit betSettled(windowGain, window, user);

        return windowGain;
    }

    function settleBet(uint upStake, uint downStake, uint poolUp, uint poolDown, uint8 betResult) public pure returns (uint) {
        BetResult result = BetResult(betResult);
        uint poolTotal = poolUp.add(poolDown);
        uint gain = 0;
        if (result == BetResult.up && poolUp != 0) {
            gain = (upStake.mul(poolTotal)).div(poolUp);
        } 

        else if (result == BetResult.down && poolDown != 0) {
            gain = (downStake.mul(poolTotal)).div(poolDown);
        }
        else if (result == BetResult.tie) {
            gain = upStake.add(downStake);
        }
        else {
            //Define what happens when the winning pool is empty.
            gain = 0;
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
        uint startingBlock = getWindowStartingBlock(windowNumber, windowDuration, firstBlock, windowOffset);
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

    function getBlockWindow (uint currentBlock, uint _windowDuration, uint _firstBlock, uint _windowOffset, uint _firstWindow) public pure returns (uint windowNumber) {
        if (currentBlock < _firstBlock) {
            windowNumber = _firstWindow;
        }
        else {
        //n = floor((block - first_block)/window_size  + 1)
            windowNumber = ((currentBlock.sub(_firstBlock)).div(_windowDuration)).add(_windowOffset).add(1); //integer division => floor    
        }

    }

    function getWindowStartingBlock (uint windowNumber, uint _windowDuration, uint _firstBlock, uint _windowOffset) public pure returns (uint startingBlock) {
        //firstBlock + (n-1 - (offset + 1))*window_size
        startingBlock =  _firstBlock + (windowNumber - 1 - _windowOffset)*_windowDuration;
    }

    function computeFee(uint value, uint _fee) public pure returns (uint betFee) {
        betFee = (value.mul(_fee)).div(100);

    }


    function updatePrice() public {
        uint window = getBlockWindow(block.number, windowDuration, firstBlock, windowOffset, firstWindow);
        if(windowPrice[window] == 0) {
            windowPrice[window] = priceOracle();
        }
    }

    //TODO Implement price API
    function priceOracle() internal returns (int currentPrice){
        currentPrice =  int(uint(keccak256(abi.encodePacked(now)))%250 + 10);
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

    function getWindowBetPrices(uint window) public view returns(int, int) {
        return (windowPrice[window+1], windowPrice[window+2]);
    }
    
    function getBlock() public view returns(uint) {
        return block.number;
    }
    
}