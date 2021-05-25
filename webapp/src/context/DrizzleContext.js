import React, { createContext, useContext, useState, useEffect } from 'react';
import _ from 'lodash';

import io from 'socket.io-client';

const DrizzleContext = createContext();

export const useDrizzle = () => {
  return useContext(DrizzleContext);
};

const dataSoc = [];

export const DrizzleProvider = ({ drizzle, children }) => {
  const [drizzleReadinessState, setDrizzleReadinessState] = useState({
    drizzleState: null,
    loading: true,
  });
  const [balance, setBalance] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [winningPercentage, setWinningPercentage] = useState(0);
  const [balKey, setBalKey] = useState(null);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [firstBlock, setFirstBlock] = useState(null)
  const [windowDuration, setWindowDuration] = useState(null)
  const [windowNumber, setWindowNumber] = useState(null);
  const [progress, setProgress] = useState(100);
  const [isOpenForBetting, setIsOpenForBetting] = useState(true);
  const [isBetPlaced, setIsBetPlaced] = useState(false);
  const [historicalChartData, setHistoricalChartData] = useState([]);
  
  // Realtime Currency Rates Socket data
  const [socketData, setSocketData] = useState([]);

  // Open for betting data
  const [openedWindowData, setOpenedWindowData] = useState({
    windowNumber: 0,
    startingBlock: 0,
    endingBlock: 0,
  });
  const [openedWindowTimestamps, setOpenedWindowTimestamps] = useState({
    startingBlockTimestamp: 0,
    endingBlockTimestamp: 0,
  });
  const [openedPricesData, setOpenedPricesData] = useState({
    initialPrice: '',
    finalPrice: '',
  });
  const [openedPoolData, setOpenedPoolData] = useState({
    betAmount: '0.00',
    betDirection: '',
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
  const [ongoingWindowTimestamps, setOngoingWindowTimestamps] = useState({
    startingBlockTimestamp: 0,
    endingBlockTimestamp: 0,
  });
  const [ongoingWindowChartData, setOngoingWindowChartData] = useState([]);
  const [ongoingPricesData, setOngoingPricesData] = useState({
    initialPrice: '0.00',
    finalPrice: '',
  });
  const [ongoingPoolData, setOngoingPoolData] = useState({
    betAmount: '0.00',
    betDirection: '',
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
  const [finalizedWindowTimestamps, setFinalizedWindowTimestamps] = useState({
    startingBlockTimestamp: 0,
    endingBlockTimestamp: 0,
  });
  const [finalizedWindowChartData, setFinalizedWindowChartData] = useState([]);
  const [finalizedPricesData, setFinalizedPricesData] = useState({
    initialPrice: '0.00',
    finalPrice: '0.00',
  });
  const [finalizedPoolData, setFinalizedPoolData] = useState({
    betAmount: '0.00',
    betDirection: '',
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
  };
  const initAccountsData = {
    accounts: 0,
  };

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

  // Contract Initials
  useEffect(() => {
    if (
      drizzleReadinessState.loading === false &&
      Object.keys(drizzleReadinessState.drizzleState.accounts).length > 0
    ) {
      const contract = drizzle.contracts.BinaryBet;
      const web3 = drizzle.web3;
      const contractWeb3 = new web3.eth.Contract(
        contract.abi,
        contract.address
      );
      
      contractWeb3.methods
        .firstBlock()
        .call()
        .then(
          (response) => setFirstBlock(Number.parseInt(response))
        );
      
      contractWeb3.methods
        .windowDuration()
        .call()
        .then(
          (response) => setWindowDuration(Number.parseInt(response))
        );
    }
  }, [
    drizzleReadinessState.loading,
    drizzle.web3,
    drizzleReadinessState.drizzleState,
  ]);

  // Balance Data
  useEffect(() => {
    if (
      drizzleReadinessState.loading === false &&
      Object.keys(drizzleReadinessState.drizzleState.accounts).length > 0 &&
      drizzleReadinessState.drizzleState.contracts.BinaryBet.getBalance
    ) {
      const contract = drizzle.contracts.BinaryBet;
      const balKey = contract.methods['getBalance'].cacheCall(drizzleReadinessState.drizzleState.accounts[0]);
      const bal =
        drizzleReadinessState.drizzleState.contracts.BinaryBet.getBalance[
          balKey
        ];
      if (bal) {
        if (bal.value) {
          const ethBal = weiToCurrency(bal.value.toString());
          setBalance(ethBal);
        }
      }
      setWalletBalance(
        weiToCurrency(
          drizzleReadinessState.drizzleState.accountBalances[
            drizzleReadinessState.drizzleState.accounts[0]
          ]
        )
      );
    }
  }, [
    drizzleReadinessState.loading,
    drizzle.web3,
    drizzleReadinessState.drizzleState,
  ]);

  // Calculate Totals
  useEffect(() => {
    if (
      drizzleReadinessState.loading === false &&
      Object.keys(drizzleReadinessState.drizzleState.accounts).length > 0
    ) {
      const contract = drizzle.contracts.BinaryBet;
      const web3 = drizzle.web3;
      const contractWeb3 = new web3.eth.Contract(
        contract.abi,
        contract.address
      );
      contractWeb3
        .getPastEvents('betSettled', {
          filter: { user: drizzleReadinessState.drizzleState.accounts[0] },
          fromBlock: 0,
          toBlock: 'latest',
        })
        .then(function (result) {
          if (result.length > 0) {
            var totalGain = 0;
            result.forEach(
              element => totalGain += weiToCurrency(element.returnValues.gain.toString())
            );

            setTotalWinnings(totalGain);

            const wins = result.filter(
              (key) => weiToCurrency(key.returnValues.gain.toString()) > 0
            );

            if (wins.length > 0) {
              setWinningPercentage(
                Number((wins.length / result.length) * 100).toFixed(2)
              );
            }
          }
        });
    }
  }, [
    drizzleReadinessState.loading,
    drizzle.web3,
    drizzleReadinessState.drizzleState,
  ]);

  // Gets Current Blockchain Block
  useEffect(() => {
    if (
      drizzleReadinessState.loading === false &&
      Object.keys(drizzleReadinessState.drizzleState.accounts).length > 0
    ) {
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
            timestamp: blockHeader.timestamp,
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
    if (!firstBlock) return;
    if (!windowDuration) return;

    const openedWindow = Math.floor(
      (currentBlock.number - firstBlock) / windowDuration + 1
    );
    const openedWindowStartingBlock =
      firstBlock + (openedWindow - 1) * windowDuration;

    // Reset data
    if (openedWindowStartingBlock === currentBlock.number) {
      setOpenedPoolData(initPoolData);
      setIsOpenForBetting(true);
      setIsBetPlaced(false);
    }

    // Current Window Number
    setWindowNumber(openedWindow);

    setOpenedWindowData({
      windowNumber: openedWindow,
      startingBlock: openedWindowStartingBlock,
      endingBlock: currentBlock.number,
    });

    updatePoolValuesForWindow(
      'Opened',
      openedWindowStartingBlock,
      currentBlock.number
    );
    updateTimestampsForWindow('Opened', currentBlock.timestamp);
  }, [currentBlock]);

  // Updates Ongoing Data
  useEffect(() => {
    if (!drizzle.contracts.BinaryBet) return;
    if (!currentBlock) return;
    if (!firstBlock) return;
    if (!windowDuration) return;

    const ongoingWindow = Math.floor(
      (currentBlock.number - firstBlock) / windowDuration + 1 - 1
    );
    const ongoingWindowStartingBlock =
      firstBlock + (ongoingWindow - 1) * windowDuration;
    const ongoingWindowEndingBlock = Math.floor(
      firstBlock + ongoingWindow * windowDuration - 1
    );

    setOngoingWindowData({
      windowNumber: ongoingWindow,
      startingBlock: ongoingWindowStartingBlock,
      endingBlock: ongoingWindowEndingBlock,
    });

    updatePricesForWindow('Ongoing', ongoingWindow);
    updatePoolValuesForWindow(
      'Ongoing',
      ongoingWindowStartingBlock,
      ongoingWindowEndingBlock
    );
    updateTimestampsForWindow('Ongoing', null);
  }, [currentBlock, windowNumber]);

  // Updates Finalized Data
  useEffect(() => {
    if (!drizzle.contracts.BinaryBet) return;
    if (!currentBlock) return;
    if (!firstBlock) return;
    if (!windowDuration) return;

    const finalizedWindow = Math.floor(
      (currentBlock.number - firstBlock) / windowDuration + 1 - 2
    );
    const finalizedWindowStartingBlock =
      firstBlock + (finalizedWindow - 1) * windowDuration;
    const finalizedWindowEndingBlock = Math.floor(
      firstBlock + finalizedWindow * windowDuration - 1
    );

    setFinalizedWindowData({
      windowNumber: finalizedWindow,
      startingBlock: finalizedWindowStartingBlock,
      endingBlock: finalizedWindowEndingBlock,
    });

    updatePricesForWindow('Finalized', finalizedWindow);
    updatePoolValuesForWindow(
      'Finalized',
      finalizedWindowStartingBlock,
      finalizedWindowEndingBlock
    );
    updateTimestampsForWindow('Finalized', null);
  }, [currentBlock, windowNumber]);

  // Charts Data
  useEffect(() => {
    if (openedWindowTimestamps.startingBlockTimestamp !== 0) {
      window
        .fetch(`${global.config.currencyRatesNodeAPI}/api/prices`, {
          method: 'post',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: openedWindowTimestamps.startingBlockTimestamp,
            to: openedWindowTimestamps.endingBlockTimestamp,
          }),
        })
        .then((res) => res.json())
        .then((result) => {
          setOngoingWindowChartData(result.result);
        });
    }
  }, [currentBlock, openedWindowTimestamps]);

  useEffect(() => {
    if (ongoingWindowTimestamps.startingBlockTimestamp !== 0) {
      window
        .fetch(`${global.config.currencyRatesNodeAPI}/api/prices`, {
          method: 'post',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: ongoingWindowTimestamps.startingBlockTimestamp,
            to: ongoingWindowTimestamps.endingBlockTimestamp,
          }),
        })
        .then((res) => res.json())
        .then((result) => {
          setFinalizedWindowChartData(result.result);
        });
    }
  }, [currentBlock, ongoingWindowTimestamps]);

  /*
  // Socket for Realtime Currency Rate data
  useEffect(() => {
    const socket = io(global.config.currencyRatesNodeAPI);
    socket.on(
      'socket-message', 
      (payload) => {
        dataSoc.push(payload.data);
        setSocketData(dataSoc);
      }
    );
  }, []);

  React.useEffect(() => {
    const arr = [...ongoingWindowChartData, ...socketData];
    const unique = _.uniqBy(arr, 'time');
    setOngoingWindowChartData(unique);
  }, [socketData]);
  */

  // Combined Chart Data
  React.useEffect(() => {
    if (openedWindowTimestamps.startingBlockTimestamp !== 0) {
      
      const today = new Date();
      const weekbefore = new Date(today.getFullYear(), today.getMonth(), today.getDate()-7);
      const selectFrom = weekbefore.getTime()/1000;
      
      window
        .fetch(`${global.config.currencyRatesNodeAPI}/api/prices`, {
          method: 'post',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: selectFrom,
            to: openedWindowTimestamps.endingBlockTimestamp,
          }),
        })
        .then((res) => res.json())
        .then((result) => {
          setHistoricalChartData(result.result);
        });
    }
  }, [currentBlock]);

  // Progress Bar
  useEffect(() => {
    if (!currentBlock) return;
    if (!windowDuration) return;
    if (!firstBlock) return;
    if (!windowNumber) return;

    const start = firstBlock + (windowNumber - 1) * windowDuration;
    const _progress =
      100 - ((currentBlock.number - start) / windowDuration) * 100;
    setProgress(_progress);
  }, [currentBlock, windowNumber]);

  // Open for betting
  useEffect(() => {
    setIsOpenForBetting(
      openedPoolData.betDirection !== '' || isBetPlaced === true ? false : true
    );
  }, [currentBlock, windowNumber, openedPoolData]);

  // Retrieve block data
  const updateTimestampsForWindow = async (where, current) => {
    if (drizzleReadinessState.loading === false) {
      var _startingBlockTimestamp = 0;
      var _endingBlockTimestamp = 0;
      
      switch (where) {
        case 'Opened':
          
          if(Number.isInteger(openedWindowData.startingBlock) === false)
            return;

          _startingBlockTimestamp = await drizzle.web3.eth
            .getBlock(openedWindowData.startingBlock)
            .then((response) => response.timestamp);

          if (current) _endingBlockTimestamp = current;
          else
            _endingBlockTimestamp = await drizzle.web3.eth
              .getBlock(openedWindowData.endingBlock)
              .then((response) => response.timestamp);

          setOpenedWindowTimestamps({
            startingBlockTimestamp: _startingBlockTimestamp,
            endingBlockTimestamp: _endingBlockTimestamp,
          });
          break;
        
        case 'Ongoing':

          if (
            Number.isInteger(ongoingWindowData.startingBlock) === false || 
            Number.isInteger(ongoingWindowData.endingBlock) === false
          )
            return;

          _startingBlockTimestamp = await drizzle.web3.eth
            .getBlock(ongoingWindowData.startingBlock)
            .then((response) => response.timestamp);

          _endingBlockTimestamp = await drizzle.web3.eth
            .getBlock(ongoingWindowData.endingBlock)
            .then((response) => response.timestamp);

          setOngoingWindowTimestamps({
            startingBlockTimestamp: _startingBlockTimestamp,
            endingBlockTimestamp: _endingBlockTimestamp,
          });
          break;
        
        case 'Finalized':

          if (
            Number.isInteger(finalizedWindowData.startingBlock) === false || 
            Number.isInteger(finalizedWindowData.endingBlock) === false
          )
            return;

          _startingBlockTimestamp = await drizzle.web3.eth
            .getBlock(finalizedWindowData.startingBlock)
            .then((response) => response.timestamp);

          _endingBlockTimestamp = await drizzle.web3.eth
            .getBlock(finalizedWindowData.endingBlock)
            .then((response) => response.timestamp);

          setFinalizedWindowTimestamps({
            startingBlockTimestamp: _startingBlockTimestamp,
            endingBlockTimestamp: _endingBlockTimestamp,
          });
          break;
        default:
      }

    }
  };

  // initialPrice , finalPrice
  const updatePricesForWindow = (where, _windowNumber) => {
    if (drizzleReadinessState.loading === false) {
      const contract = drizzle.contracts.BinaryBet;
      const web3 = drizzle.web3;
      const contractWeb3 = new web3.eth.Contract(
        contract.abi,
        contract.address
      );

      if(Number.isInteger(_windowNumber) === false)
        return;

      contractWeb3
        .getPastEvents('priceUpdated', {
          filter: { windowNumber: [_windowNumber + 1, _windowNumber + 2] },
          fromBlock: 0,
          toBlock: 'latest',
        })
        .then((result) => {
          const initialPrice =
            result.length > 0
              ? weiToCurrency(result[0].returnValues.price.toString())
              : '0.00';
          let finalPrice = '0.00';
          if (where === 'Finalized') {
            finalPrice =
              result.length > 1
                ? weiToCurrency(result[1].returnValues.price.toString())
                : '0.00';
          }
          updatePriceData(where, { initialPrice, finalPrice });
        });
    }
  };

  const updatePriceData = (key, data) => {
    switch (key) {
      case 'Ongoing':
        setOngoingPricesData({ ...data });
        break;
      case 'Finalized':
        setFinalizedPricesData({ ...data });
        break;
      default:
    }
  };

  const updatePoolValuesForWindow = (where, startingBlock, endingBlock) => {
    if (
      drizzleReadinessState.loading === false &&
      Object.keys(drizzleReadinessState.drizzleState.accounts).length > 0
    ) {
      const contract = drizzle.contracts.BinaryBet;
      const web3 = drizzle.web3;
      const contractWeb3 = new web3.eth.Contract(
        contract.abi,
        contract.address
      );

      if(isNaN(startingBlock) || isNaN(endingBlock))
        return;

      contractWeb3
        .getPastEvents('newBet', {
          fromBlock: startingBlock,
          toBlock: endingBlock,
        })
        .then((result) => {
          var _betAmount = 0;
          var _betDirection = '';
          var _poolSize = 0;
          var _poolTotalUp = 0;
          var _poolTotalDown = 0;

          if (result.length > 0) {
            // poolSize
            _poolSize = result.reduce((acc, current) => {
              return acc + weiToCurrency(current.returnValues.value.toString());
            }, 0);
            _poolSize = _poolSize.toFixed(2);

            // poolTotalUp
            _poolTotalUp = result
              .filter((key) => Number.parseInt(key.returnValues.side) === 1)
              .reduce((acc, current) => {
                return acc + weiToCurrency(current.returnValues.value.toString());
              }, 0);
            _poolTotalUp = _poolTotalUp.toFixed(2);

            // poolTotalDown
            _poolTotalDown = result
              .filter((key) => Number.parseInt(key.returnValues.side) === 0)
              .reduce((acc, current) => {
                return acc + weiToCurrency(current.returnValues.value.toString());
              }, 0);
            _poolTotalDown = _poolTotalDown.toFixed(2);

            // user bet amount and direction
            const currentUser = result.filter(
              (key) =>
                key.returnValues.user.toLowerCase() === drizzleReadinessState.drizzleState.accounts[0].toLowerCase()
            );
            if (currentUser.length > 0) {
              _betAmount = weiToCurrency(currentUser[0].returnValues.value.toString()).toFixed(2);
              _betDirection =
                Number.parseInt(currentUser[0].returnValues.side) === 1
                  ? 'up'
                  : 'down';
            }
          }

          updatePoolAndAccountsData(where, {
            accounts: result,
            _betAmount,
            _betDirection,
            _poolTotalUp,
            _poolTotalDown,
            _poolSize,
          });
        });
    }
  };

  const updatePoolAndAccountsData = (key, details) => {
    switch (key) {
      case 'Opened':
        setOpenedPoolData(
          details.accounts.length > 0
            ? {
                betAmount: details._betAmount,
                betDirection: details._betDirection,
                poolTotalUp: details._poolTotalUp,
                poolTotalDown: details._poolTotalDown,
                poolSize: details._poolSize,
              }
            : initPoolData
        );
        setOpenedAccountsData({
          accounts: details.accounts.length,
        });
        break;
      case 'Ongoing':
        setOngoingPoolData(
          details.accounts.length > 0
            ? {
                betAmount: details._betAmount,
                betDirection: details._betDirection,
                poolTotalUp: details._poolTotalUp,
                poolTotalDown: details._poolTotalDown,
                poolSize: details._poolSize,
              }
            : initPoolData
        );
        setOngoingAccountsData({
          accounts: details.accounts.length,
        });
        break;
      case 'Finalized':
        setFinalizedPoolData(
          details.accounts.length > 0
            ? {
                betAmount: details._betAmount,
                betDirection: details._betDirection,
                poolTotalUp: details._poolTotalUp,
                poolTotalDown: details._poolTotalDown,
                poolSize: details._poolSize,
              }
            : initPoolData
        );
        setFinalizedAccountsData({
          accounts: details.accounts.length,
        });
        break;
      default:
    }
  };

  const weiToCurrency = (value) => {
    if (!value) return;
    const valueInCurrency = drizzle.web3.utils.fromWei(value, global.config.currencyRequestValue);
    return parseFloat(valueInCurrency);
  };

  const value = {
    drizzle,
    drizzleReadinessState,
    currentBlock,
    balance,
    walletBalance,
    totalWinnings,
    winningPercentage,
    progress,
    isOpenForBetting,
    setIsOpenForBetting,
    isBetPlaced,
    setIsBetPlaced,
    windowNumber,
    openedWindowData,
    openedPricesData,
    openedPoolData,
    openedAccountsData,
    ongoingWindowData,
    ongoingPricesData,
    ongoingPoolData,
    ongoingAccountsData,
    ongoingWindowChartData,
    finalizedWindowData,
    finalizedPricesData,
    finalizedPoolData,
    finalizedAccountsData,
    finalizedWindowChartData,
    historicalChartData,
    socketData,
  };

  return (
    <DrizzleContext.Provider value={value}>{children}</DrizzleContext.Provider>
  );
};