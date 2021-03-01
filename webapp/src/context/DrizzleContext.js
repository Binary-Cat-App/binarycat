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
  const [windowEndingNumber, setWindowEndingNumber] = useState(null);
  const [windowFinalizedNumber, setWindowFinalizedNumber] = useState(null);
  const [progress, setProgress] = useState(100);
  const [currentData, setCurrentData] = useState({
    poolTotalUp: '1.00',
    poolTotalDown: '1.00',
    poolSize: '2.00',
  });
  const [endingData, setEndingData] = useState({
    poolTotalUp: '1.00',
    poolTotalDown: '1.00',
    poolSize: '2.00',
  });
  const [finalizedData, setFinalizedData] = useState({
    poolTotalUp: '1.00',
    poolTotalDown: '1.00',
    poolSize: '2.00',
  });

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
            // console.log(event); // same results as the optional callback above
          })
          .on('changed', function (event) {
            // remove event from local database
          })
          .on('error', function (error, receipt) {
            // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
            //
          });
      }, 3000);
    }
  }, [drizzleReadinessState.loading, drizzle.web3]);

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

  useEffect(() => {
    if (!currentBlock) return;
    const current = Math.floor(
      (currentBlock.number - FIRST_BLOCK) / WINDOW_DURATION + 1
    );
    const ending = Math.floor(
      FIRST_BLOCK + (current - 1) * WINDOW_DURATION - 1
    );
    const finallized = Math.floor(
      FIRST_BLOCK + (current - 2) * WINDOW_DURATION - 1
    );
    setWindowNumber(current);
    setWindowEndingNumber(ending);
    setWindowFinalizedNumber(finallized);
  }, [currentBlock]);

  useEffect(() => {
    if (!currentBlock) return;
    const current = Math.floor(
      (currentBlock.number - FIRST_BLOCK) / WINDOW_DURATION + 1
    );
    const start = FIRST_BLOCK + (current - 1) * WINDOW_DURATION;
    const _progress =
      100 - ((currentBlock.number - start) / WINDOW_DURATION) * 100;
    setProgress(_progress);
  }, [currentBlock, windowNumber]);

  useEffect(() => {
    if (!drizzle.contracts.BinaryBet) return;
    if (!currentBlock) return;
    const contract = drizzle.contracts.BinaryBet;
    const wn = Math.floor(
      (currentBlock.number - FIRST_BLOCK) / WINDOW_DURATION + 1
    );
    const winKey = contract.methods['getPoolValues'].cacheCall(wn);
    const windowData =
      drizzleReadinessState.drizzleState.contracts.BinaryBet.getPoolValues[
        winKey
      ];
    if (windowData) {
      const values = calcValues(windowData.value);
      setCurrentData(values);
    }

    const ending = Math.floor(FIRST_BLOCK + (wn - 1) * WINDOW_DURATION - 1);
    const winEndingKey = contract.methods['getPoolValues'].cacheCall(ending);
    const winEndingData =
      drizzleReadinessState.drizzleState.contracts.BinaryBet.getPoolValues[
        winEndingKey
      ];
    if (winEndingData) {
      const values = calcValues(winEndingData.value);
      const initialPrice = getPriceForBlock(winEndingData.value['0']);
      setEndingData({ ...values, initialPrice });
    }

    const finallized = Math.floor(FIRST_BLOCK + (wn - 2) * WINDOW_DURATION - 1);
    const winFinalizedKey = contract.methods['getPoolValues'].cacheCall(ending);
    const winFinalizedData =
      drizzleReadinessState.drizzleState.contracts.BinaryBet.getPoolValues[
        winFinalizedKey
      ];
    if (winFinalizedData) {
      const values = calcValues(winFinalizedData.value);
      const initialPrice = getPriceForBlock(winFinalizedData.value['0']);
      const finalPrice = getPriceForBlock(winFinalizedData.value['3']);
      console.log({ initialPrice, finalPrice });
      setFinalizedData({ ...values, initialPrice, finalPrice });
    }
  }, [currentBlock]);

  // initialPrice , finalPrice
  const getPriceForBlock = (blockNumber) => {
    if (!drizzle.contracts.BinaryBet) return;
    const contract = drizzle.contracts.BinaryBet;
    const winKey = contract.methods['getPrice'].cacheCall(blockNumber);
    const windowData =
      drizzleReadinessState.drizzleState.contracts.BinaryBet.getPrice[winKey];
    if (windowData) {
      return Number(windowData.value).toFixed(2);
    }
    return '0.00';
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
    windowEndingNumber,
    windowFinalizedNumber,
    currentData,
    endingData,
    finalizedData,
  };

  return (
    <DrizzleContext.Provider value={value}>{children}</DrizzleContext.Provider>
  );
};
