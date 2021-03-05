import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMetaMask } from '../context/MataMaskContext';

const DrizzleContext = createContext();

export const useDrizzle = () => {
  return useContext(DrizzleContext);
};

const FIRST_BLOCK = 1;
const WINDOW_DURATION = 10;

export const DrizzleProvider = ({ drizzle, children }) => {
  const [drizzleReadinessState, setDrizzleReadinessState] = useState({
    drizzleState: null,
    loading: true,
  });
  const [balance, setBalance] = useState(0);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [winningPercentage, setWinningPercentage] = useState(0);
  const [balKey, setBalKey] = useState(null);
  const { ethAccount } = useMetaMask();
  const [currentBlock, setCurrentBlock] = useState(null);
  const [windowNumber, setWindowNumber] = useState(null);
  const [progress, setProgress] = useState(100);
  
  // Open for betting data
  const [openedWindowData, setOpenedWindowData] = useState({
    windowNumber: 0,
    startingBlock: 0,
    endingBlock: 0,
  });
  const [openedPoolData, setOpenedPoolData] = useState({
    betAmount: '0.00',
    betDirection: '',
    initialPrice: '', 
    finalPrice: '',
    poolTotalUp: '0.00',
    poolTotalDown: '0.00',
    poolSize: '0.00',
  });
  const [openedAccountsData, setOpenedAccountsData] = useState({
    accounts: 0,
  });

  // Ongoing data
  const [ongoingWindowData, setOngoingWindowData] = useState({
    windowNumber: 0,
    startingBlock: 0,
    endingBlock: 0,
  });
  const [ongoingPoolData, setOngoingPoolData] = useState({
    betAmount: '0.00',
    betDirection: '',
    initialPrice: '0.00',
    finalPrice: '',
    poolTotalUp: '0.00',
    poolTotalDown: '0.00',
    poolSize: '0.00',
  });
  const [ongoingAccountsData, setOngoingAccountsData] = useState({
    accounts: 0,
  });

  // Finalized data
  const [finalizedWindowData, setFinalizedWindowData] = useState({
    windowNumber: 0,
    startingBlock: 0,
    endingBlock: 0,
  });
  const [finalizedPoolData, setFinalizedPoolData] = useState({
    betAmount: '0.00',
    betDirection: '',
    initialPrice: '0.00',
    finalPrice: '0.00',
    poolTotalUp: '0.00',
    poolTotalDown: '0.00',
    poolSize: '0.00',
  });
  const [finalizedAccountsData, setFinalizedAccountsData] = useState({
    accounts: 0,
  });

  // Resets
  const initPoolData = {
    betAmount: '0.00',
    betDirection: '',
    initialPrice: '', 
    finalPrice: '',
    poolTotalUp: '0.00',
    poolTotalDown: '0.00',
    poolSize: '0.00',
  }
  const initAccountsData = {
    accounts: 0,
  }

  // Balance Data
  useEffect(() => {
    if (
      drizzleReadinessState.loading === false &&
      drizzleReadinessState.drizzleState.contracts.BinaryBet.getBalance
    ) {
      const contract = drizzle.contracts.BinaryBet;
      const balKey = contract.methods['getBalance'].cacheCall(ethAccount);
      const bal =
        drizzleReadinessState.drizzleState.contracts.BinaryBet.getBalance[
          balKey
        ];
      if (bal) {
        if (bal.value) {
          const ethBal = weiToCurrency(bal.value);
          setBalance(ethBal);
        }
      }
    }
  }, [
    drizzleReadinessState.loading,
    drizzle.web3,
    drizzleReadinessState.drizzleState,
  ]);

  // Drizzle Readiness State
  useEffect(() => {
    const unsubscribe = drizzle.store.subscribe(() => {
      // every time the store updates, grab the state from drizzle
      const drizzleState = drizzle.store.getState();
      // check to see if it's ready, if so, update local component state
      if (drizzleState.drizzleStatus.initialized) {
        setDrizzleReadinessState({
          drizzleState: drizzleState,
          loading: false,
        });
      }
    });
    return () => {
      unsubscribe();
    };
  }, [drizzle.store, drizzleReadinessState]);

  // Calculate Totals
  useEffect(() => {
    if (drizzleReadinessState.loading === false) {
      const contract = drizzle.contracts.BinaryBet;
      const web3 = drizzle.web3;
      const contractWeb3 = new web3.eth.Contract(
        contract.abi,
        contract.address
      );
      contractWeb3.getPastEvents(
        'betSettled', 
        {
          fromBlock: 0,
          toBlock: 'latest'
        }
      )
      .then(function(events){
        const result = events.filter(key => key.returnValues.user.toLowerCase() == ethAccount.toLowerCase());

        var totalGain = 0;
        result.forEach(element => totalGain += Number.parseInt(element.returnValues.gain));
        const _totalWinnings = weiToCurrency(totalGain.toString());
        setTotalWinnings(_totalWinnings);

        const wins = result.filter(key => Number.parseInt(key.returnValues.gain) > 0);
        const _winningPercentage = Number((wins.length / events.length) * 100).toFixed(2);
        setWinningPercentage(_winningPercentage);
      });
    }
  }, [drizzleReadinessState.loading, drizzle.web3, drizzleReadinessState.drizzleState]);

  // Gets Current Blockchain Block
  useEffect(() => {
    if (drizzleReadinessState.loading === false) {
      drizzle.web3.eth.getBlock('latest').then((data) => {
        setCurrentBlock({ number: data.number, hash: data.hash });
      });
      var subscription = drizzle.web3.eth
        .subscribe('newBlockHeaders')
        .on('connected', function (subscriptionId) {
          //console.log(subscriptionId);
        })
        .on('data', function (blockHeader) {
          setCurrentBlock({
            number: blockHeader.number,
            hash: blockHeader.hash,
          });
        })
        .on('error', console.error);

      // unsubscribes the subscription
      return () => {
        subscription.unsubscribe(function (error, success) {
          if (success) {
            console.log('Successfully unsubscribed!');
          }
        });
      };
    }
  }, [drizzleReadinessState.loading]);

  // Updates Opened data
  useEffect(() => {
    if (!drizzle.contracts.BinaryBet) return;
    if (!currentBlock) return;
    const contract = drizzle.contracts.BinaryBet;
    const web3 = drizzle.web3;
    const contractWeb3 = new web3.eth.Contract(
      contract.abi,
      contract.address
    );

    const openedWindow = Math.floor(
      (currentBlock.number - FIRST_BLOCK) / WINDOW_DURATION + 1
    );
    const openedWindowStartingBlock = FIRST_BLOCK + (openedWindow - 1) * WINDOW_DURATION;

    setWindowNumber(openedWindow);

    setOpenedWindowData({
      windowNumber: openedWindow,
      startingBlock: openedWindowStartingBlock,
      endingBlock: currentBlock.number,
    });

    const userBet = getUserStakeForWindow(openedWindow);
    const poolData = getPoolValuesForWindow(openedWindow);

    setOpenedPoolData({
      ...openedPoolData,
      ...poolData,
      ...userBet,
    });

    contractWeb3.getPastEvents(
      'newBet', 
      {
        fromBlock: openedWindowStartingBlock,
        toBlock: currentBlock.number
      }
    )
    .then(function(events){
      setOpenedAccountsData({accounts: events.length});
    });

    // Reset data
    if ( openedWindowStartingBlock === currentBlock.number) {
      setOpenedPoolData(initPoolData);
      setOpenedAccountsData(initAccountsData);
    }

  }, [currentBlock]);

  // Updates Ongoing Data
  useEffect(() => {
    if (!drizzle.contracts.BinaryBet) return;
    if (!currentBlock) return;
    const contract = drizzle.contracts.BinaryBet;
    const web3 = drizzle.web3;
    const contractWeb3 = new web3.eth.Contract(
      contract.abi,
      contract.address
    );

    const ongoingWindow = Math.floor(
      ((currentBlock.number - FIRST_BLOCK) / WINDOW_DURATION + 1) - 1
    );
    const ongoingWindowStartingBlock = FIRST_BLOCK + (ongoingWindow - 1) * WINDOW_DURATION;
    const ongoingWindowEndingBlock = Math.floor(
      (FIRST_BLOCK + (ongoingWindow * WINDOW_DURATION)) - 1
    );

    setOngoingWindowData({
      windowNumber: ongoingWindow,
      startingBlock: ongoingWindowStartingBlock,
      endingBlock: ongoingWindowEndingBlock,
    });

    const userBet = getUserStakeForWindow(ongoingWindow);
    const prices = getPricesForWindow(ongoingWindow);
    const poolData = getPoolValuesForWindow(ongoingWindow);

    setOngoingPoolData({
      ...ongoingPoolData,
      ...prices,
      ...poolData,
      ...userBet,
    });

    contractWeb3.getPastEvents(
      'newBet', 
      {
        fromBlock: ongoingWindowStartingBlock,
        toBlock: ongoingWindowEndingBlock
      }
    )
    .then(function(events){
      setOngoingAccountsData({accounts: events.length});
    });

  }, [currentBlock]);

  // Updates Finalized Data
  useEffect(() => {
    if (!drizzle.contracts.BinaryBet) return;
    if (!currentBlock) return;
    const contract = drizzle.contracts.BinaryBet;
    const web3 = drizzle.web3;
    const contractWeb3 = new web3.eth.Contract(
      contract.abi,
      contract.address
    );
    
    const finalizedWindow = Math.floor(
      ((currentBlock.number - FIRST_BLOCK) / WINDOW_DURATION + 1) - 2
    );
    const finalizedWindowStartingBlock = FIRST_BLOCK + (finalizedWindow - 1) * WINDOW_DURATION;
    const finalizedWindowEndingBlock = Math.floor(
      (FIRST_BLOCK + (finalizedWindow * WINDOW_DURATION)) - 1
    );

    setFinalizedWindowData({
      windowNumber: finalizedWindow,
      startingBlock: finalizedWindowStartingBlock,
      endingBlock: finalizedWindowEndingBlock,
    });

    const userBet = getUserStakeForWindow(finalizedWindow);
    const prices = getPricesForWindow(finalizedWindow);
    const poolData = getPoolValuesForWindow(finalizedWindow);

    setFinalizedPoolData({
      ...finalizedPoolData,
      ...prices,
      ...poolData,
      ...userBet,
    });

    contractWeb3.getPastEvents(
      'newBet', 
      {
        fromBlock: finalizedWindowStartingBlock,
        toBlock: finalizedWindowEndingBlock
      }
    )
    .then(function(events){
      setFinalizedAccountsData({accounts: events.length});
    });

  }, [currentBlock]);

  // Progress Bar
  useEffect(() => {
    if (!currentBlock) return;
    const start = FIRST_BLOCK + (windowNumber - 1) * WINDOW_DURATION;
    const _progress =
      100 - ((currentBlock.number - start) / WINDOW_DURATION) * 100;
    setProgress(_progress);
  }, [currentBlock, windowNumber]);

  // initialPrice , finalPrice
  const getPricesForWindow = (_windowNumber) => {
    if (!drizzle.contracts.BinaryBet) return;
    const contract = drizzle.contracts.BinaryBet;
    const winKey = contract.methods['getWindowBetPrices'].cacheCall(_windowNumber);
    const windowData =
      drizzleReadinessState.drizzleState.contracts.BinaryBet.getWindowBetPrices[winKey];
    if (windowData) {
      const initialPrice = Number(windowData.value[0]).toFixed(2);
      const finalPrice = Number(windowData.value[1]).toFixed(2);
      return { initialPrice, finalPrice };
    }
    return;
  };

  const getUserStakeForWindow = (_windowNumber) => {
    if (!drizzle.contracts.BinaryBet) return;
    const contract = drizzle.contracts.BinaryBet;
    
    const _userStake = {
      betDirection: '',
      betAmount: '0.00'
    }

    if (ethAccount) {
      const stakeKey = contract.methods['getUserStake'].cacheCall(_windowNumber, ethAccount);
      const stakeData =
        drizzleReadinessState.drizzleState.contracts.BinaryBet.getUserStake[
          stakeKey
        ];

      if( stakeData ) {
        if (stakeData.value[0] != 0) {
          _userStake.betDirection = 'down';
          _userStake.betAmount = weiToCurrency(stakeData.value[0]);
        } 
        else if (stakeData.value[1] != 0) {
          _userStake.betDirection = 'up';
          _userStake.betAmount = weiToCurrency(stakeData.value[1]);
        }
      }
    }

    return _userStake;
  };

  const getPoolValuesForWindow = (_windowNumber) => {
    if (!drizzle.contracts.BinaryBet) return;
    const contract = drizzle.contracts.BinaryBet;

    const poolKey = contract.methods['getPoolValues'].cacheCall(_windowNumber);
    const poolData =
      drizzleReadinessState.drizzleState.contracts.BinaryBet.getPoolValues[
        poolKey
      ];
    if (poolData) {
      const poolTotalUp = weiToCurrency(poolData.value['2']);
      const poolTotalDown = weiToCurrency(poolData.value['1']);
      const poolSize = (Number(poolTotalUp) + Number(poolTotalDown)).toFixed(2);

      return { poolTotalUp, poolTotalDown, poolSize };
    }
    return;
  };

  const weiToCurrency = (value) => {
    if (!value) return;
    const valueInCurrency = Math.round(
      drizzle.web3.utils.fromWei(
        value,
        global.config.currencyRequestValue
      ) * 100
    ) / 100;

    return Number(valueInCurrency).toFixed(2);
  };

  const value = {
    drizzle,
    drizzleReadinessState,
    currentBlock,
    balance,
    totalWinnings,
    winningPercentage,
    progress,
    windowNumber,
    openedWindowData,
    openedPoolData,
    openedAccountsData,
    ongoingWindowData,
    ongoingPoolData,
    ongoingAccountsData,
    finalizedWindowData,
    finalizedPoolData,
    finalizedAccountsData,
  };

  return (
    <DrizzleContext.Provider value={value}>{children}</DrizzleContext.Provider>
  );
};