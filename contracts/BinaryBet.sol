pragma solidity ^0.6.8;
import "@openzeppelin/contracts/math/SafeMath.sol";

//SPDX-License-Identifier: UNLICENSED
contract BinaryBet {
    using SafeMath for uint256;

    BettingWindow firstWindow;
    uint windowDuration; //in timestamp
    uint timeForBetting;     //in timestamp

    uint fee;
    address payable owner;
    mapping(uint => uint) ethPrice;
    enum BetSide {down, up} 

    enum BetResult {down, up, tie}
 
    struct Pool {
        uint settlementTimestamp;
        uint upValue;
        uint downValue;
        uint referencePrice;
    }
    
    struct BettingWindow {
        uint startingTimestamp;
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
    

    
    constructor(uint _firstWindowTimestamp, uint _windowDuration, uint _timeForBetting, uint _fee) public{
        require(_fee <= 100);
        firstWindow = BettingWindow(_firstWindowTimestamp, Pool(_firstWindowTimestamp.add(_windowDuration), 0,0, getTimestampPrice(block.timestamp))) ;
        timeForBetting = _timeForBetting;
        windowDuration = _windowDuration;
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
        uint windowNumber = getTimestampWindow(block.timestamp);
        uint startingTimestamp = getWindowStartingTimestamp(windowNumber);
        uint lastBetTimestamp = getWindowLastBettingTimestamp(startingTimestamp);
        
        uint gain = updateBalance(msg.sender, userWindows[msg.sender]);
        balance[msg.sender] = balance[msg.sender].add(gain);

        require(block.timestamp <= lastBetTimestamp, "bets closed for this window");
        require(betValue <= balance[msg.sender].add(msg.value), "not enough money to place this bet");

        balance[msg.sender] = balance[msg.sender].sub(betValue);
        uint betFee = computeFee(betValue, fee); 
        owner.transfer(betFee);

        uint value = betValue.sub(betFee);
        userWindows[msg.sender].push(windowNumber);

        if(windows[windowNumber].windowPool.settlementTimestamp != 0) { //window exists (cant remember the best way to check this)
            updatePool (windowNumber, value, uint8(side));
        }

        else {
            createPool (windowNumber, startingTimestamp, value, uint8(side));
        }
        updateStake(msg.sender, uint8(side), windowNumber, value);
    }       

        function updateBalance(address user, uint[] memory _userWindowsList) public returns(uint){
        uint totalGain = 0;
        uint[] storage userWindowsList = userWindows[user];
        for (uint i = userWindowsList.length; i >= 0; i--) {
            Pool memory pool = windows[userWindowsList[i]].windowPool;
            if(block.timestamp < pool.settlementTimestamp) {
                continue;
            }
            else {
                uint referencePrice = pool.referencePrice;
                uint settlementPrice = getTimestampPrice(pool.settlementTimestamp);
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
    function createPool (uint windowNumber, uint startingTimestamp, uint value, uint8 betSide) public {
            require(windows[windowNumber].windowPool.settlementTimestamp == 0, "pool already exists");
            BetSide side = BetSide(betSide);
            if (side == BetSide.down) { //down
              Pool memory newPool = Pool(startingTimestamp.add(windowDuration), 0, value, getTimestampPrice(startingTimestamp));
              windows[windowNumber] = BettingWindow(startingTimestamp, newPool);
             }
             
             else  { //up
              Pool memory newPool = Pool(startingTimestamp.add(windowDuration), value, 0, getTimestampPrice(startingTimestamp));
              windows[windowNumber] = BettingWindow(startingTimestamp, newPool);
             }  
    }
    

    //Internal but set as public for testing
    function getTimestampWindow (uint currentTimestamp) public view returns (uint windowNumber) {
        //n = floor((beg block - first_block)/window_size  + 1)
        windowNumber = ((currentTimestamp.sub(windows[0].startingTimestamp)).div(windowDuration)).add(1); //integer division => floor    
    }

    //Internal but set as public for testing
    function getWindowStartingTimestamp (uint windowNumber) public view returns (uint startingTimestamp) {
        //firstBlock + (n-1)*window_size
        startingTimestamp =  windows[0].startingTimestamp.add((windowNumber.sub(1)).mul(windowDuration));
    }
    
    //Internal but set as public for testing
    function getWindowLastBettingTimestamp (uint startingTimestamp) public view returns (uint lastBettingTimestamp) {
            return startingTimestamp.add(timeForBetting);
    }


    function getPoolValues(uint windowNumber) public view returns (uint, uint, uint, uint) {
        Pool memory pool = windows[windowNumber].windowPool;
        return (pool.settlementTimestamp, pool.downValue, pool.upValue, pool.referencePrice);
    }

    function computeFee(uint value, uint _fee) public pure returns (uint betFee) {
        betFee = (value.mul(_fee)).div(100); 

    }


    function getTimestampPrice(uint timestamp) internal returns (uint){
        if(ethPrice[timestamp] == 0) {
            ethPrice[timestamp] = priceOracle(timestamp);
        }
        return ethPrice[timestamp];
    }
    
    //TODO Implement price API
    function priceOracle(uint timestamp) internal returns (uint currentPrice){
        return 100;
    }



}

