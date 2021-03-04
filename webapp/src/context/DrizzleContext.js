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
    initialPrice: '', 
    finalPrice: '',
    poolTotalUp: '0.00',
    poolTotalDown: '0.00',
    poolSize: '0.00',
  });
  const [openedAccountsData, setOpenedAccountsData] = useState(0);

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
  const [ongoingAccountsData, setOngoingAccountsData] = useState(0);

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
  const [finalizedAccountsData, setFinalizedAccountsData] = useState(0);

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
          const ethBal =
            Math.round(
              drizzle.web3.utils.fromWei(
                bal.value,
                global.config.currencyRequestValue
              ) * 100
            ) / 100;
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

  /*
  useEffect(() => {
    if (drizzleReadinessState.loading === false) {
      const contract = drizzle.contracts.BinaryBet;
      const web3 = drizzle.web3;
      const yourContractWeb3 = new web3.eth.Contract(
        contract.abi,
        contract.address
      );
      setInterval(() => {
        yourContractWeb3.events
          .allEvents({ fromBlock: 0, toBlock: 'latest' }, function (
            error,
            event
          ) {
            // console.log(event);
          })
          .on('connected', function (subscriptionId) {
            // console.log(subscriptionId);
          })
          .on('data', function (event) {
            // same results as the optional callback above
          })
          .on('changed', function (event) {
            // remove event from local database
          })
          .on('error', function (error, receipt) {
            // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
          });
      }, 3000);
    }
  }, [drizzleReadinessState.loading, drizzle.web3]);
  */

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

    // Opened for betting window Pool Data
    if (openedWindow) {
      const winKey = contract.methods['getPoolValues'].cacheCall(openedWindow);
      const windowData =
        drizzleReadinessState.drizzleState.contracts.BinaryBet.getPoolValues[
          winKey
        ];
      if (windowData) {
        const values = calcValues(windowData.value);
        setOpenedPoolData({
          ...openedPoolData,
          ...values,
        })
      }
    }

    contractWeb3.getPastEvents(
      'newBet', 
      {
        fromBlock: openedWindowStartingBlock,
        toBlock: currentBlock.number
      }
    )
    .then(function(events){
      setOpenedAccountsData(events.length);
    });

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

    // Ongoing window Pool Data
    if (ongoingWindow) {
      const winOngoingKey = contract.methods['getPoolValues'].cacheCall(ongoingWindow);
      const winOngoingData =
        drizzleReadinessState.drizzleState.contracts.BinaryBet.getPoolValues[
          winOngoingKey
        ];
      if (winOngoingData) {
        const prices = getPricesForWindow(ongoingWindow);
        const values = calcValues(winOngoingData.value);
        setOngoingPoolData({
          ...ongoingPoolData,
          ...prices,
          ...values,
        });
      }
    }

    contractWeb3.getPastEvents(
      'newBet', 
      {
        fromBlock: ongoingWindowStartingBlock,
        toBlock: ongoingWindowEndingBlock
      }
    )
    .then(function(events){
      setOngoingAccountsData(events.length);
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

    // Finalized window Pool Data
    if (finalizedWindow) {
      const winFinalizedKey = contract.methods['getPoolValues'].cacheCall(finalizedWindow);
      const winFinalizedData =
        drizzleReadinessState.drizzleState.contracts.BinaryBet.getPoolValues[
          winFinalizedKey
        ];
      if (winFinalizedData) {
        const prices = getPricesForWindow(finalizedWindow);
        const values = calcValues(winFinalizedData.value);
        setFinalizedPoolData({
          ...finalizedPoolData,
          ...prices,
          ...values,
        });
      }
    }

    contractWeb3.getPastEvents(
      'newBet', 
      {
        fromBlock: finalizedWindowStartingBlock,
        toBlock: finalizedWindowEndingBlock
      }
    )
    .then(function(events){
      setFinalizedAccountsData(events.length);
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
  const getPricesForWindow = (windowNumber) => {
    if (!drizzle.contracts.BinaryBet) return;
    const contract = drizzle.contracts.BinaryBet;
    const winKey = contract.methods['getWindowBetPrices'].cacheCall(windowNumber);
    const windowData =
      drizzleReadinessState.drizzleState.contracts.BinaryBet.getWindowBetPrices[winKey];
    if (windowData) {
      const initialPrice = Number(windowData.value[0]).toFixed(2);
      const finalPrice = Number(windowData.value[1]).toFixed(2);
      return { initialPrice, finalPrice };
    }
    return;
  };

  const calcValues = (values) => {
    const upValue =
      Math.round(
        drizzle.web3.utils.fromWei(
          values['2'],
          global.config.currencyRequestValue
        ) * 100
      ) / 100;
    const downValue =
      Math.round(
        drizzle.web3.utils.fromWei(
          values['1'],
          global.config.currencyRequestValue
        ) * 100
      ) / 100;
    const poolTotalUp = Number(upValue).toFixed(2);
    const poolTotalDown = Number(downValue).toFixed(2);
    const poolSize = (Number(upValue) + Number(downValue)).toFixed(2);
    return { poolTotalUp, poolTotalDown, poolSize };
  };

  const value = {
    drizzle,
    drizzleReadinessState,
    currentBlock,
    balance,
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