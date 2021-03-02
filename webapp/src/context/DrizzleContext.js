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
  const [windowOngoingNumber, setWindowOngoingNumber] = useState(null);
  const [windowOngoingEndingBlock, setwindowOngoingEndingBlock] = useState(null);
  const [windowFinalizedNumber, setWindowFinalizedNumber] = useState(null);
  const [windowFinalizedEndingBlock, setWindowFinalizedEndingBlock] = useState(null);
  const [progress, setProgress] = useState(100);
  
  // Open for betting window data
  const [currentData, setCurrentData] = useState({
    poolTotalUp: '0.00',
    poolTotalDown: '0.00',
    poolSize: '0.00',
  });

  // Ongoing window data
  const [ongoingData, setOngoingData] = useState({
    poolTotalUp: '0.00',
    poolTotalDown: '0.00',
    poolSize: '0.00',
  });

  // Finalized window data
  const [finalizedData, setFinalizedData] = useState({
    poolTotalUp: '0.00',
    poolTotalDown: '0.00',
    poolSize: '0.00',
  });

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

  // Calculates Window Numbers (Open for betting, Ongoing and Finalized)
  // Calculates Ending Blocks for Ongoing and Finalized betting windows
  useEffect(() => {
    if (!currentBlock) return;
    const current = Math.floor(
      (currentBlock.number - FIRST_BLOCK) / WINDOW_DURATION + 1
    );

    const ongoing = current - 1;
    const finallized = current - 2;

    const ongoingEndingBlock = Math.floor(
      FIRST_BLOCK + (current - 1) * WINDOW_DURATION - 1
    );
    const finallizedEndingBlock = Math.floor(
      FIRST_BLOCK + (current - 2) * WINDOW_DURATION - 1
    );

    setWindowNumber(current);
    
    setWindowOngoingNumber(ongoing);
    setwindowOngoingEndingBlock(ongoingEndingBlock);
    
    setWindowFinalizedNumber(finallized);
    setWindowFinalizedEndingBlock(finallizedEndingBlock);
  }, [currentBlock]);

  // Progress Bar
  useEffect(() => {
    if (!currentBlock) return;
    const start = FIRST_BLOCK + (windowNumber - 1) * WINDOW_DURATION;
    const _progress =
      100 - ((currentBlock.number - start) / WINDOW_DURATION) * 100;
    setProgress(_progress);
  }, [currentBlock, windowNumber]);

  useEffect(() => {
    if (!drizzle.contracts.BinaryBet) return;
    if (!currentBlock) return;
    const contract = drizzle.contracts.BinaryBet;
    
    // Opened for betting window Pool Data
    if (windowNumber) {
      const winKey = contract.methods['getPoolValues'].cacheCall(windowNumber);
      const windowData =
        drizzleReadinessState.drizzleState.contracts.BinaryBet.getPoolValues[
          winKey
        ];
      if (windowData) {
        const values = calcValues(windowData.value);
        setCurrentData(values);
      }
    }

    // Ongoing window Pool Data
    if (windowOngoingNumber) {
      const winOngoingKey = contract.methods['getPoolValues'].cacheCall(windowOngoingNumber);
      const winOngoingData =
        drizzleReadinessState.drizzleState.contracts.BinaryBet.getPoolValues[
          winOngoingKey
        ];
      if (winOngoingData) {
        const values = calcValues(winOngoingData.value);
        const prices = getPricesForWindow(windowOngoingNumber);
        setOngoingData({ ...values, ...prices });
      }
    }

    // Finalized window Pool Data
    if (windowFinalizedNumber) {
      const winFinalizedKey = contract.methods['getPoolValues'].cacheCall(windowFinalizedNumber);
      const winFinalizedData =
        drizzleReadinessState.drizzleState.contracts.BinaryBet.getPoolValues[
          winFinalizedKey
        ];
      if (winFinalizedData) {
        const values = calcValues(winFinalizedData.value);
        const prices = getPricesForWindow(windowFinalizedNumber);
        setFinalizedData({ ...values, ...prices });
      }
    }
  }, [currentBlock]);

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
    windowOngoingNumber,
    windowOngoingEndingBlock,
    windowFinalizedNumber,
    windowFinalizedEndingBlock,
    currentData,
    ongoingData,
    finalizedData,
  };

  return (
    <DrizzleContext.Provider value={value}>{children}</DrizzleContext.Provider>
  );
};