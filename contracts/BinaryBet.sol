pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./BinToken.sol";
import "./BinStaking.sol";

interface IStdReference {
    /// A structure returned whenever someone requests for standard reference data.
    struct ReferenceData {
        uint256 rate; // base/quote exchange rate, multiplied by 1e18.
        uint256 lastUpdatedBase; // UNIX epoch of the last time when base price gets updated.
        uint256 lastUpdatedQuote; // UNIX epoch of the last time when quote price gets updated.
    }

    /// Returns the price data for the given base/quote pair. Revert if not available.
    function getReferenceData(string calldata _base, string calldata _quote)
        external
        view
        returns (ReferenceData memory);

    /// Similar to getReferenceData, but with multiple base/quote pairs at once.
    function getReferenceDataBulk(string[] calldata _bases, string[] calldata _quotes)
        external
        view
        returns (ReferenceData[] memory);
}


//SPDX-License-Identifier: UNLICENSED
contract BinaryBet {
    using SafeMath for uint256;

    //Structs and enums
    enum BetSide {down, up} 
    enum BetResult {down, up, tie}

    struct Pool {
        uint downValue;
        uint upValue;
    }

    //Betting parameters
    IStdReference oracle;
    address governance;
    uint public fee;
    uint public windowDuration; //in blocks
    uint public firstBlock;
    BinaryStaking staking; 
    address payable stakingAddress;

    //Window management
    mapping (uint => Pool) public pools; //windowNumber => Pool
    mapping(uint => uint256) public  windowPrice; //first price collection at the window.
    uint public firstWindow = 1; //Any bet before first block of betting is directed to the first window.
    uint public windowOffset; //used make window continuous and monotonically increasing when window duration and first block changes.
    uint public accumulatedFees;

    //User variables
    mapping (address => uint) public balance;
    mapping (address => mapping(uint => Pool)) public  userStake;
    mapping (address => mapping(uint => bool)) public  userBetted;
    mapping (address => uint[]) public userBets;


    //EVENTS
    event newBet(address indexed user, uint indexed windowNumber, uint value, uint8 side);
    event newDeposit(address indexed user, uint value);
    event newWithdraw(address indexed user, uint value);
    event betSettled(uint indexed windowNumber, address indexed user, uint gain);
    event priceUpdated(uint indexed windowNumber, uint256 price);

    
    modifier onlyGovernance() {
        require(msg.sender == governance, "only governance can call this method");
        _;
    }

    constructor(uint _firstWindowBlock, uint _windowDuration, uint _fee) public {
        require(_fee <= 100);
        oracle = IStdReference(address(0xDA7a001b254CD22e46d3eAB04d937489c93174C3));
        firstBlock = _firstWindowBlock;
        windowDuration = _windowDuration;

        fee = _fee;
        governance = msg.sender;
        firstWindow = 1;
    }
//=============GOVERNANCE FUNCTIONS=============================================
    function changeGovernance(address newGovernance) onlyGovernance public{
        governance = newGovernance;
    }

    function changeWindowSize(uint windowSize) onlyGovernance public {
        require(windowSize > 0, "window size should be strictly positive");
        uint currentWindow = getWindowNumber(block.number, windowDuration, firstBlock, windowOffset, firstWindow);
        firstBlock = getWindowStartingBlock(currentWindow.add(1), windowDuration, firstBlock, windowOffset);
        windowOffset = currentWindow;
        firstWindow = currentWindow;
        windowDuration = windowSize;
    }

    function setStakingAddress(address stakingContract) external {
        require(stakingAddress == address(0), "staking address already set");
        stakingAddress = payable(stakingContract);
        staking = BinaryStaking(stakingAddress); 
    }
//==============================================================================
    function deposit() payable external {
        updatePrice();
        balance[msg.sender] = balance[msg.sender].add(msg.value);
        emit newDeposit(msg.sender, msg.value);
    }

    function withdraw(uint value) external {
        updatePrice();
        updateBalance(msg.sender);

        require(value <= balance[msg.sender], "not enough funds");
        balance[msg.sender] = balance[msg.sender].sub(value);
        msg.sender.transfer(value);

        emit newWithdraw(msg.sender, value);

    }

    function placeBet (uint betValue, uint8 side) payable external {
        updatePrice();
        updateBalance(msg.sender);
                    
        uint windowNumber = getWindowNumber(block.number, windowDuration, firstBlock, windowOffset, firstWindow);
        require(!userBetted[msg.sender][windowNumber], "user can only bet one time per window"); 
        require(betValue <= balance[msg.sender].add(msg.value), "not enough money to place this bet");

        //betValue <= balance + msg.value
        //0 <= balance + msg.value - betValue
        balance[msg.sender] = balance[msg.sender].add(msg.value).sub(betValue);

        uint betFee = computeFee(betValue, fee); 
        accumulatedFees = accumulatedFees.add(betFee);
        uint value = betValue.sub(betFee);

        userBets[msg.sender].push(windowNumber);
        userBetted[msg.sender][windowNumber] = true;
        
        //Update the pool for the window.
        Pool memory oldPool = pools[windowNumber];
        (uint newDown, uint newUp) = updatePool(oldPool.downValue, oldPool.upValue, side, value);
        pools[windowNumber] = Pool(newDown, newUp);

        //Update the user stake for the window.
        Pool memory oldStake = userStake[msg.sender][windowNumber];
        (newDown, newUp) = updatePool(oldStake.downValue, oldStake.upValue, side, value);
        userStake[msg.sender][windowNumber] = Pool(newDown, newUp);

        emit newBet(msg.sender, windowNumber, value, side);
    }

    function updateBalance(address user) public {
        uint[] storage userWindowsList = userBets[user];
        if(userWindowsList.length == 0) {
            return;
        }

        for(uint i = userWindowsList.length; i > 0; i--) {
            //Maximum number of itens in list is 2, when the user bets on 2 subsequent windows and the first window is not yet settled.
            uint window = userWindowsList[i-1];

            (uint256 referencePrice, uint256 settlementPrice) = getWindowBetPrices(window);

            if(settlementPrice == 0) {
                continue;
            }

            Pool memory stake = userStake[user][window];
            Pool memory pool = pools[window];
            uint8 result = betResult(referencePrice, settlementPrice);
            (uint windowGain, uint fees) = settleBet(stake.upValue, stake.downValue, pool.downValue, pool.upValue, result);

            balance[msg.sender] = balance[msg.sender].add(windowGain);
            accumulatedFees = accumulatedFees.add(fees);

            emit betSettled(window, user, windowGain);
            userWindowsList[i-1] = userWindowsList[userWindowsList.length -1];
            userWindowsList.pop();
        }

        if(accumulatedFees > 0) {
            staking.receiveFunds.value(accumulatedFees)();
            accumulatedFees = 0;
        }

    }

    function settleBet(uint upStake, uint downStake, uint poolUp, uint poolDown, uint8 betResult) public pure returns (uint gain, uint fees) {
        BetResult result = BetResult(betResult);
        uint poolTotal = poolUp.add(poolDown);
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
            //If the winning pool is empty, all stake goes to the fees.
            gain = 0;
            fees = upStake.add(downStake);
        }
    }

   function betResult(uint256 referencePrice, uint256 settlementPrice) public pure returns(uint8){
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


    function updatePool(uint _downValue, uint _upValue, uint8 side, uint value) public pure returns(uint, uint){
        BetSide betSide = BetSide(side);
        uint upValue = _upValue;
        uint downValue = _downValue;
        if (betSide == BetSide.down) {
            downValue = downValue.add(value);
        }
        if (betSide == BetSide.up) {
            upValue = upValue.add(value);
        }
        return (downValue, upValue);

    }

    function getWindowNumber (uint currentBlock, uint _windowDuration, uint _firstBlock, uint _windowOffset, uint _firstWindow) public pure returns (uint windowNumber) {
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
        uint window = getWindowNumber(block.number, windowDuration, firstBlock, windowOffset, firstWindow);
        if(windowPrice[window] == 0) {
            windowPrice[window] = priceOracle();
        emit priceUpdated(window, windowPrice[window]);
            
        }
    }

    function priceOracle() internal returns (uint256){
        IStdReference.ReferenceData memory data = oracle.getReferenceData("BNB","USD");
        return data.rate;
    }

    //Getters
    function getPoolValues(uint windowNumber) public view returns (uint, uint) {
        Pool memory pool = pools[windowNumber];
        return (pool.downValue, pool.upValue);
    }

    function getUserStake(uint windowNumber, address user) public view returns (uint, uint) {
        Pool  memory stake  = userStake[user][windowNumber];
        return (stake.downValue, stake.upValue);
    }

    function getBalance(address user) public view returns(uint) {
        return balance[user];
    }

    function getWindowBetPrices(uint window) public view returns(uint256, uint256) {
        return (windowPrice[window+1], windowPrice[window+2]);
    }
}
