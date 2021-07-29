pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import "./BinToken.sol";
import "./BinStaking.sol";


//SPDX-License-Identifier: UNLICENSED
contract BinaryBet {
    //using WadRayMath for uint256;

    //Structs and enums
    enum BetSide {down, up} 
    enum BetResult {down, up, tie}

    struct Pool {
        uint downValue;
        uint upValue;
    }

    //Betting parameters
    AggregatorV3Interface internal priceFeed;  
    address governance;
    uint public fee;
    uint public windowDuration; //in blocks
    uint public firstBlock;
    BinaryStaking staking; 
    address payable stakingAddress;

    BinToken token;
    address tokenAddress;


    //Window management
    mapping (uint => Pool) public pools; //windowNumber => Pool
    mapping(uint => uint256) public  windowPrice; //first price collection at the window.
    uint public firstWindow = 1; //Any bet before first block of betting is directed to the first window.
    uint public windowOffset; //used make window continuous and monotonically increasing when window duration and first block changes.
    uint public accumulatedFees;

    //User variables
    mapping (address => uint) public balance;
    mapping (address => mapping(uint => Pool)) public  userStake;
    mapping (address => uint[]) public userBets;
    mapping (address => mapping(uint => bool)) userBetted;


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

    constructor(uint _windowDuration, uint _fee) public {
        require(_fee <= 100);
        priceFeed = AggregatorV3Interface(0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526);
        firstBlock = block.number;
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
        firstBlock = getWindowStartingBlock(currentWindow + 1, windowDuration, firstBlock, windowOffset);
        windowOffset = currentWindow;
        firstWindow = currentWindow;
        windowDuration = windowSize;
    }
//==============================================================================

    function setStakingAddress(address stakingContract) external {
        require(stakingAddress == address(0), "staking address already set");
        stakingAddress = payable(stakingContract);
        staking = BinaryStaking(stakingAddress); 
    }

    function setTokenAddress(address tokenContract) external {
        require(tokenAddress == address(0), "token address already set");
        tokenAddress = tokenContract;
        token = BinToken(tokenAddress); 
    }

    function deposit() payable external {
        updatePrice();
        balance[msg.sender] = balance[msg.sender] + msg.value;
        emit newDeposit(msg.sender, msg.value);
    }

    function withdraw(uint value) external {
        updatePrice();
        updateBalance(msg.sender);

        require(value <= balance[msg.sender], "not enough funds");
        balance[msg.sender] = balance[msg.sender] - value;
        payable(msg.sender).transfer(value);

        emit newWithdraw(msg.sender, value);

    }

    function placeBet (uint betValue, uint8 side) payable external {
        updatePrice();
        updateBalance(msg.sender);
                    
        require(betValue <= balance[msg.sender] + msg.value, "not enough money to place this bet");

        //betValue <= balance + msg.value
        //0 <= balance + msg.value - betValue
        balance[msg.sender] = balance[msg.sender] + msg.value - betValue;

        uint betFee = computeFee(betValue, fee); 
        accumulatedFees = accumulatedFees + betFee;
        uint value = betValue - betFee;

        uint windowNumber = getWindowNumber(block.number, windowDuration, firstBlock, windowOffset, firstWindow);
        if(!userBetted[msg.sender][windowNumber]) {
            //only adds the bet to the list if it is the first time the user bets at the window
            userBets[msg.sender].push(windowNumber);
            userBetted[msg.sender][windowNumber] = true;
        }
        
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
            //No bets to settle
            return;
        }

        for(uint i = userWindowsList.length; i > 0; i--) {
            //Maximum number of itens in list is 2, when the user bets on 2 subsequent windows and the first window is not yet settled.
            uint window = userWindowsList[i-1];
            uint currentWindow = getWindowNumber(block.number, windowDuration, firstBlock, windowOffset, firstWindow);
            if(currentWindow < window + 2) {
                //window not yet settled
                continue;
            }

            (uint256 referencePrice, uint256 settlementPrice) = getWindowBetPrices(window);
            if (settlementPrice == 0 && currentWindow < window + 3) {
                //price not updated but update still possible.
                continue;
            } 

            uint8 result = betResult(referencePrice, settlementPrice);
            if (referencePrice == 0 || settlementPrice == 0) {
                //if the price was not updated for the window it is considered a tie and players can get their money back.
                result = 2;
            }

            //Remove window from list of unsettled bets.
            userWindowsList[i-1] = userWindowsList[userWindowsList.length -1];
            userWindowsList.pop();

            Pool memory stake = userStake[user][window];
            Pool memory pool = pools[window];
            (uint windowGain, uint fees) = settleBet(stake.upValue, stake.downValue, pool.upValue, pool.downValue, result);

            balance[user] = balance[user] + windowGain;
            accumulatedFees = accumulatedFees + fees;
            
            //KITTY token rewards
            uint reward = calculateTokenReward(stake.upValue, stake.downValue, pool.upValue, pool.downValue);
            if (token.balanceOf(address(this)) >= reward) {
                token.transfer(user, reward);
            }

            emit betSettled(window, user, windowGain);
        }

        if(accumulatedFees > 0) {
            staking.receiveFunds{value: accumulatedFees}();
            accumulatedFees = 0;
        }

    }

    function settleBet(uint upStake, uint downStake, uint poolUp, uint poolDown, uint8 betResult) public pure returns (uint gain, uint fees) {
        BetResult result = BetResult(betResult);
        uint poolTotal = poolUp + poolDown;
        if (result == BetResult.up && poolUp != 0) {
            //(upStake/poolUp)*poolTotal
            gain = (upStake*poolTotal) / poolUp;
        } 

        else if (result == BetResult.down && poolDown != 0) {
            //(downStake/poolDown)*poolTotal
            gain = (downStake*poolTotal) / poolDown;
        }
        else if (result == BetResult.tie) {
            gain = upStake + downStake;
        }
        else {
            //If the winning pool is empty, all stake goes to the fees.
            gain = 0;
            fees = upStake + downStake;
        }
    }

   function betResult(uint256 referencePrice, uint256 settlementPrice) public pure returns(uint8){
        if(settlementPrice < referencePrice) {
            return 0;
        }
        else if(settlementPrice > referencePrice) {
            return 1;
        }
        return 2;
    }

    function calculateTokenReward(uint upStake, uint downStake, uint poolUp, uint poolDown) public pure returns (uint) {
        uint REWARD_PER_WINDOW = 665 ether;
        return ((upStake + downStake)*REWARD_PER_WINDOW)/(poolUp + poolDown);
    }


    function updatePool(uint downValue, uint upValue, uint8 side, uint value) public pure returns(uint, uint){
        BetSide betSide = BetSide(side);
        if (betSide == BetSide.down) {
            return (downValue + value, upValue);
        }
        if (betSide == BetSide.up) {
            return (downValue, upValue + value);
        }
    }

    function getWindowNumber (uint currentBlock, uint _windowDuration, uint _firstBlock, uint _windowOffset, uint _firstWindow) public pure returns (uint windowNumber) {
        if (currentBlock < _firstBlock) {
            windowNumber = _firstWindow;
        }
        else {
        //n = floor((block - first_block)/window_size  + 1)
            windowNumber = ((currentBlock - _firstBlock) / _windowDuration) + _windowOffset + 1; //integer division => floor    
        }

    }

    function getWindowStartingBlock (uint windowNumber, uint _windowDuration, uint _firstBlock, uint _windowOffset) public pure returns (uint startingBlock) {
        //firstBlock + (n-1 - (offset + 1))*window_size
        startingBlock =  _firstBlock + (windowNumber - 1 - _windowOffset)*_windowDuration;
    }

    function computeFee(uint value, uint _fee) public pure returns (uint betFee) {
        betFee = (value * _fee) / 100;

    }


    function updatePrice() public {
        uint window = getWindowNumber(block.number, windowDuration, firstBlock, windowOffset, firstWindow);
        if(windowPrice[window] == 0) {
            windowPrice[window] = priceOracle();
            emit priceUpdated(window, windowPrice[window]);
        }
    }

    function priceOracle() internal returns (uint256){
        //(
             //, 
            //int price,
             //,
             //,
             //
        //) = priceFeed.latestRoundData();
        //return uint256(price);
        return (uint(keccak256(abi.encodePacked(block.timestamp)))%20 + 640);
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

    function getUserBetList(address user, uint index) public view returns (uint) {
         return userBets[user][index];
    }

    function betListLen(address user) public view returns (uint) {
        return userBets[user].length;
    }
}
