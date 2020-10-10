pragma solidity ^0.6.8;

contract BinaryBet {

    BettingWindow firstWindow;
    uint bettingWindowTotalSize;
    uint blocksForBetting;
    
    enum BetSide {down, up} 

    
    
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
    
    mapping (uint => BettingWindow) windows; //windowNumber => window

    

    
    constructor(uint _firstWindowBlock, uint _bettingWindowTotalSize, uint _blocksForBetting) public{
        firstWindow = BettingWindow(_firstWindowBlock, Pool(_firstWindowBlock + _bettingWindowTotalSize, 0,0, getBlockPrice(block.number))) ;
        blocksForBetting = _blocksForBetting;
        bettingWindowTotalSize = _bettingWindowTotalSize;
        windows[0] = firstWindow;
    }

    
    function bet (uint value, BetSide side) payable external {
        uint windowNumber = getBlockWindow(block.number);
        uint startingBlock = getWindowStartingBlock(windowNumber);
        uint lastBetBlock = getWindowLastBettingBlock(startingBlock);

        require(block.number <= lastBetBlock, "bets closed for this window");
        if(windows[windowNumber].windowPool.settlementBlock != 0) { //window exists (cant remember the best way to check this)
            updatePool (windowNumber, value, uint8(side));
        }

        else {
            createPool (windowNumber, startingBlock, value, uint8(side));
        }
    }        
    


    //Internal but set as public for testing
    function updatePool (uint windowNumber, uint value, uint8 side) public {
        BetSide side = BetSide(side);
        if (side == BetSide.down) { //down
              windows[windowNumber].windowPool.downValue += value;
        }
        
        if (side == BetSide.up) {
              windows[windowNumber].windowPool.upValue += value;
        }
        

    }

    //Internal but set as public for testing
    function createPool (uint windowNumber, uint startingBlock, uint value, uint8 side) public {
            require(windows[windowNumber].windowPool.settlementBlock == 0, "pool already exists");
            BetSide side = BetSide(side);
            if (side == BetSide.down) { //down
              Pool memory newPool = Pool(startingBlock + bettingWindowTotalSize, 0, value, getBlockPrice(startingBlock));
              windows[windowNumber] = BettingWindow(startingBlock, newPool);
             }
             
             else  { //up
              Pool memory newPool = Pool(startingBlock + bettingWindowTotalSize, value, 0, getBlockPrice(startingBlock));
              windows[windowNumber] = BettingWindow(startingBlock, newPool);
             }  
    }
    

    //Internal but set as public for testing
    function getBlockWindow (uint currentBlock) public view returns (uint windowNumber) {
        //n = floor((beg block - first_block)/window_size  + 1)
        windowNumber = (currentBlock - windows[0].startingBlock)/bettingWindowTotalSize + 1; //integer division => floor    
    }

    //Internal but set as public for testing
    function getWindowStartingBlock (uint windowNumber) public view returns (uint startingBlock) {
        //firstBlock + (n-1)*window_size
        startingBlock =  windows[0].startingBlock + (windowNumber -1)*bettingWindowTotalSize;
    }
    
    //Internal but set as public for testing
    function getWindowLastBettingBlock (uint startingBlock) public view returns (uint lastBettingBlock) {
        return startingBlock + blocksForBetting;
    }

    //TODO Implement price API
    function getBlockPrice(uint blockNumber) internal returns (uint currentPrice){
        return 100;
    }

    function getPoolValues(uint windowNumber) public view returns (uint, uint, uint, uint) {
        Pool memory pool = windows[windowNumber].windowPool;
        return (pool.settlementBlock, pool.downValue, pool.upValue, pool.referencePrice);
    }

}

