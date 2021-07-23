import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { differenceInDays } from 'date-fns';
import _ from 'lodash';

import io from 'socket.io-client';

const DrizzleContext = createContext();

export const useDrizzle = () => {
  return useContext(DrizzleContext);
};

export const DrizzleProvider = ({ drizzle, children }) => {
  const [drizzleReadinessState, setDrizzleReadinessState] = useState({
    drizzleState: null,
    loading: true,
  });
  const [balance, setBalance] = useState(0);
  const [unsettledBets, setUnsettledBets] = useState(0);
  const [unsettledWins, setUnsettledWins] = useState(0);
  const [unsettledGains, setUnsettledGains] = useState(0);
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
    poolTotalUp: '0.00',
    poolTotalDown: '0.00',
    poolSize: '0.00',
  };
  const initAccountsData = {
    accounts: 0,
  };
  const resetOngoingPricesData = {
    initialPrice: '0.00',
    finalPrice: '',
  };
  const resetFinalizedPricesData = {
    initialPrice: '0.00',
    finalPrice: '0.00',
  };

  const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };

  const prevBlock = usePrevious( currentBlock );
  const prevWindowNumber = usePrevious( windowNumber );
  const prevOpenedWindowTimestamps = usePrevious( openedWindowTimestamps );
  const prevOngoingWindowTimestamps = usePrevious( ongoingWindowTimestamps );

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
      const web3 = drizzle.web3;
      const contractWeb3 = new web3.eth.Contract(
        contract.abi,
        contract.address
      );

      contractWeb3.methods
        .getBalance(drizzleReadinessState.drizzleState.accounts[0])
        .call({
          from: drizzleReadinessState.drizzleState.accounts[0]
        })
        .then(function(result) {
          const ethBal = weiToCurrency(result.toString());
          // User SmartContract Balance
          setBalance(ethBal + unsettledGains);
        });

      // User Personal Wallet
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
    drizzleReadinessState.drizzleState
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

      totalsPrecalculations();

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

            setTotalWinnings(totalGain + unsettledGains);

            const wins = result.filter(
              (key) => weiToCurrency(key.returnValues.gain.toString()) > 0
            );

            if (wins.length > 0) {
              setWinningPercentage(
                Number(
                  ( ( wins.length + unsettledWins ) / ( result.length + unsettledBets ) ) * 100
                ).toFixed(2)
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

  // Windows data
  useEffect(() => {
    if (!drizzle.contracts.BinaryBet) return;

    const openedWindow = windowCalculations('Opened');
    const ongoingWindow = windowCalculations('Ongoing');
    const finalizedWindow = windowCalculations('Finalized');
    
    if ( 
          openedWindow && ongoingWindow && finalizedWindow &&
          currentBlock && prevBlock &&
          Number(prevBlock.number) !== Number(currentBlock.number)
    ) {
      
      // Reset data
      if ( Number(openedWindow.startingBlock) === Number(currentBlock.number) ) {
        setOpenedPoolData(initPoolData);
        setIsOpenForBetting(true);
        setIsBetPlaced(false);
      }

      if (prevWindowNumber != openedWindow.windowNumber ) {
        
        setWindowNumber(openedWindow.windowNumber);
        
        setOpenedWindowData({
          windowNumber: openedWindow.windowNumber,
          startingBlock: openedWindow.startingBlock,
          endingBlock: openedWindow.endingBlock,
        });
        
        setOngoingWindowData({
          windowNumber: ongoingWindow.windowNumber,
          startingBlock: ongoingWindow.startingBlock,
          endingBlock: ongoingWindow.endingBlock,
        });
        
        setFinalizedWindowData({
          windowNumber: finalizedWindow.windowNumber,
          startingBlock: finalizedWindow.startingBlock,
          endingBlock: finalizedWindow.endingBlock,
        });
      
      }

      updatePoolValuesForWindow(
        'Opened',
        openedWindow.startingBlock,
        currentBlock.number
      );

      updateTimestampsForWindow('Opened', currentBlock.timestamp);

      if ( Number(openedWindow.endingBlock) > Number(currentBlock.number) ) {

        updatePricesForWindow('Ongoing', ongoingWindow.windowNumber);
        updatePricesForWindow('Finalized', finalizedWindow.windowNumber);

        updatePoolValuesForWindow(
          'Ongoing',
          ongoingWindow.startingBlock,
          ongoingWindow.endingBlock
        );
        updatePoolValuesForWindow(
          'Finalized',
          finalizedWindow.startingBlock,
          finalizedWindow.endingBlock
        );

        updateTimestampsForWindow('Ongoing', null);
        updateTimestampsForWindow('Finalized', null);

      }
      else {

        setOngoingWindowChartData([]);
        setFinalizedWindowChartData([]);

        setOngoingPricesData(resetOngoingPricesData);
        setFinalizedPricesData(resetFinalizedPricesData);
        
        setOngoingPoolData(initPoolData);
        setFinalizedPoolData(initPoolData);

        setOngoingAccountsData(initAccountsData);
        setFinalizedAccountsData(initAccountsData);

      }
    
    }

  }, [currentBlock]);

  // Charts Data
  useEffect(() => {
    const startBlockDate = new Date(openedWindowTimestamps.startingBlockTimestamp * 1000);
    const endBlockDate = new Date(openedWindowTimestamps.endingBlockTimestamp * 1000);
    const dayDifference = differenceInDays(endBlockDate, startBlockDate);
    const shouldFetchPrices = openedWindowTimestamps.startingBlockTimestamp !== 0
      && openedWindowTimestamps.startingBlockTimestamp !== prevOpenedWindowTimestamps.startingBlockTimestamp
      && openedWindowTimestamps.startingBlockTimestamp !== openedWindowTimestamps.endingBlockTimestamp
      && dayDifference <= 1;

    if (shouldFetchPrices) {
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
          if (result.result.length > 0) {
            setOngoingWindowChartData(result.result);
          }
        });
    }
  }, [windowNumber, openedWindowTimestamps]);

  useEffect(() => {
    if (
          ongoingWindowTimestamps.startingBlockTimestamp !== 0 &&
          ongoingWindowTimestamps.endingBlockTimestamp !== prevOngoingWindowTimestamps.endingBlockTimestamp &&
          ongoingWindowTimestamps.startingBlockTimestamp !== ongoingWindowTimestamps.endingBlockTimestamp
    ) {
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
          if(result.result.length > 0) {
            setFinalizedWindowChartData(result.result);
          }
        });
    }
  }, [windowNumber, ongoingWindowTimestamps]);

  // Combined Chart Data
  React.useEffect(() => {

    const today = new Date();
    const nextdate = new Date(today.getFullYear(), today.getMonth(), today.getDate()+1);
    const prevdate = new Date(today.getFullYear(), today.getMonth(), today.getDate()-1);
    const selectFrom = prevdate.getTime()/1000;
    const selectTo = nextdate.getTime()/1000;

    window
      .fetch(`${global.config.currencyRatesNodeAPI}/api/prices`, {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: selectFrom,
          to: selectTo,
        }),
      })
      .then((res) => res.json())
      .then((result) => {
        if(result.result.length > 0) {
          setHistoricalChartData(result.result);
        }
      });

  }, []);

  // Socket for Realtime Currency Rate data
  React.useEffect(() => {
    const socket = io(global.config.currencyRatesNodeAPI);
    socket.on(
      'socket-message',
      (payload) => {
        if ( payload.data ) {
          setSocketData([payload.data]);
        }
      }
    );
  }, []);

  React.useEffect(() => {
    if (socketData.length > 0) {
      const arr = [...ongoingWindowChartData, ...socketData];
      const arr2 = [...historicalChartData, ...socketData];
      const unique = _.uniqBy(arr, 'time');
      const unique2 = _.uniqBy(arr2, 'time');

      setOngoingWindowChartData(unique);
      setHistoricalChartData(unique2);
    }
  }, [socketData]);

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

          if(
            Number(ongoingWindowTimestamps.startingBlockTimestamp) !== Number(_startingBlockTimestamp) ||
            Number(ongoingWindowTimestamps.endingBlockTimestamp) !== Number(_endingBlockTimestamp)
          ) {
            setOngoingWindowTimestamps({
              startingBlockTimestamp: _startingBlockTimestamp,
              endingBlockTimestamp: _endingBlockTimestamp,
            });
          }

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

          if(
            Number(finalizedWindowTimestamps.startingBlockTimestamp) !== Number(_startingBlockTimestamp) ||
            Number(finalizedWindowTimestamps.endingBlockTimestamp) !== Number(_endingBlockTimestamp)
          ) {
            setFinalizedWindowTimestamps({
              startingBlockTimestamp: _startingBlockTimestamp,
              endingBlockTimestamp: _endingBlockTimestamp,
            });
          }

          break;
        default:
      }

    }
  };

  // initialPrice , finalPrice
  const updatePricesForWindow = async (where, _windowNumber) => {
    if (drizzleReadinessState.loading === false) {
      const contract = drizzle.contracts.BinaryBet;
      const web3 = drizzle.web3;
      const contractWeb3 = new web3.eth.Contract(
        contract.abi,
        contract.address
      );

      if(Number.isInteger(_windowNumber) === false)
        return;

      const prices = await contractWeb3
        .getPastEvents('priceUpdated', {
          filter: { windowNumber: [_windowNumber + 1, _windowNumber + 2] },
          fromBlock: 0,
          toBlock: 'latest',
        })
        .then((result) => result);

      const initialPrice = prices.length > 0 
        ? weiToCurrency((prices[0].returnValues.price * 10000000000).toString())
        : '0.00';

      let finalPrice = '0.00';
      
      if (where === 'Finalized') {
        finalPrice = prices.length > 1
          ? weiToCurrency((prices[1].returnValues.price  * 10000000000).toString())
          : '0.00';
      }

      switch ( where ) {
        
        case 'Ongoing':
          if( 
              parseFloat(initialPrice) !== parseFloat(ongoingPricesData.initialPrice) 
          ) {
            setOngoingPricesData({ initialPrice, finalPrice });
          }
          break;
        
        case 'Finalized':
          if( 
              parseFloat(initialPrice) !== parseFloat(finalizedPricesData.initialPrice) || 
              parseFloat(finalPrice) !== parseFloat(finalizedPricesData.finalPrice)
          ) {
            setFinalizedPricesData({ initialPrice, finalPrice });
          }
          break;
        
        default:
      }
    }
  };

  const updatePoolValuesForWindow = async (where, startingBlock, endingBlock) => {
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

      var _betAmount = 0;
      var _betDirection = '';
      var _poolSize = 0;
      var _poolTotalUp = 0;
      var _poolTotalDown = 0;

      const result = await contractWeb3
        .getPastEvents('newBet', {
          fromBlock: startingBlock,
          toBlock: endingBlock,
        })
        .then((result) => result);

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

    }
  };

  const updatePoolAndAccountsData = (key, details) => {
    switch (key) {
      
      case 'Opened':
        
        if (
          Number(openedAccountsData.accounts) !== details.accounts.length ||
          parseFloat(openedPoolData.betAmount) !== parseFloat(details._betAmount) ||
          openedPoolData.betDirection !== details._betDirection ||
          parseFloat(openedPoolData.poolTotalUp) !== parseFloat(details._poolTotalUp) ||
          parseFloat(openedPoolData.poolTotalDown) !== parseFloat(details._poolTotalDown) ||
          parseFloat(openedPoolData.poolSize) !== parseFloat(details._poolSize)
        ) {
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
        }
        
        if ( Number(openedAccountsData.accounts) !== details.accounts.length ) {
          setOpenedAccountsData({
            accounts: details.accounts.length,
          });
        }

        break;
      
      case 'Ongoing':

        if (
          Number(ongoingAccountsData.accounts) !== details.accounts.length ||
          parseFloat(ongoingPoolData.betAmount) !== parseFloat(details._betAmount) ||
          ongoingPoolData.betDirection !== details._betDirection ||
          parseFloat(ongoingPoolData.poolTotalUp) !== parseFloat(details._poolTotalUp) ||
          parseFloat(ongoingPoolData.poolTotalDown) !== parseFloat(details._poolTotalDown) ||
          parseFloat(ongoingPoolData.poolSize) !== parseFloat(details._poolSize)
        ) {
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
        }

        if ( Number(ongoingAccountsData.accounts) !== details.accounts.length ) {
          setOngoingAccountsData({
            accounts: details.accounts.length,
          });
        }

        break;
      
      case 'Finalized':

        if (
          Number(finalizedAccountsData.accounts) !== details.accounts.length ||
          parseFloat(finalizedPoolData.betAmount) !== parseFloat(details._betAmount) ||
          finalizedPoolData.betDirection !== details._betDirection ||
          parseFloat(finalizedPoolData.poolTotalUp) !== parseFloat(details._poolTotalUp) ||
          parseFloat(finalizedPoolData.poolTotalDown) !== parseFloat(details._poolTotalDown) ||
          parseFloat(finalizedPoolData.poolSize) !== parseFloat(details._poolSize)
        ) {
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
        }

        if ( Number(finalizedAccountsData.accounts) !== details.accounts.length ) {
          setFinalizedAccountsData({
            accounts: details.accounts.length,
          });
        }

        break;
      default:
    }
  };

  // Totals Pre-calculations
  const totalsPrecalculations = async () => {
    if (drizzleReadinessState.loading === false) {

      const contract = drizzle.contracts.BinaryBet;
      const web3 = drizzle.web3;
      const contractWeb3 = new web3.eth.Contract(
        contract.abi,
        contract.address
      );

      var unsettledUserBets = 0;
      var unsettledUserWins = 0;
      var unsettledUserGains = 0;
      
      const unsettledBetsCount = await contractWeb3.methods
        .betListLen(drizzleReadinessState.drizzleState.accounts[0])
        .call({
          from: drizzleReadinessState.drizzleState.accounts[0]
        })
        .then((response) => response);

      if (unsettledBetsCount > 0) {

        // unsettledBetsCount is the length of the unsettledBets array

        for (let i = 0; i < unsettledBetsCount; i++) {

          const userBetList = await contractWeb3.methods
            .getUserBetList(
              drizzleReadinessState.drizzleState.accounts[0],
              i
            )
            .call({
              from: drizzleReadinessState.drizzleState.accounts[0]
            })
            .then((response) => response);

          if (userBetList > 0) {

            // userBetList is BettingWindow #

            const windowBetPrices = await contractWeb3.methods
              .getWindowBetPrices(
                userBetList
              )
              .call({
                from: drizzleReadinessState.drizzleState.accounts[0]
              })
              .then((response) => response);

            if (windowBetPrices) {
              const prices = Object.values(windowBetPrices)
              prices[0] = weiToCurrency(prices[0].toString());
              prices[1] = weiToCurrency(prices[1].toString());

              if( prices[0] !== 0 && prices[1] !== 0) {

                unsettledUserBets = unsettledUserBets + 1;

                // 0 = Down, 1 = Up, 2 = Tie
                const priceDirection = ( prices[0] > prices[1] ) ? 0 : ( prices[0] < prices[1] ) ? 1 : 2 ;

                const userStake = await contractWeb3.methods
                  .getUserStake(
                    userBetList,
                    drizzleReadinessState.drizzleState.accounts[0]
                  )
                  .call({
                    from: drizzleReadinessState.drizzleState.accounts[0]
                  })
                  .then((response) => response);

                if (userStake) {
                  const userBet = Object.values(userStake);
                  
                  const windowPoolValues = await contractWeb3.methods
                    .getPoolValues(
                      userBetList
                    )
                    .call({
                      from: drizzleReadinessState.drizzleState.accounts[0]
                    })
                    .then((response) => response);

                  if (windowPoolValues) {
                    const poolValues = Object.values(windowPoolValues);
                    
                    const settledBet = await contractWeb3.methods
                      .settleBet(
                        userBet[1], 
                        userBet[0], 
                        poolValues[1], 
                        poolValues[0], 
                        priceDirection
                      )
                      .call({
                        from: drizzleReadinessState.drizzleState.accounts[0]
                      })
                      .then((response) => response);

                    if (settledBet) {
                      const gain = weiToCurrency(settledBet.gain.toString());
                      
                      if (gain > 0) {
                        unsettledUserWins = unsettledUserWins + 1;
                        unsettledUserGains = unsettledUserGains + gain;
                      }

                    }

                  }

                }

              }

            }

          }
        
        }

      }

      setUnsettledBets(unsettledUserBets);
      setUnsettledWins(unsettledUserWins);
      setUnsettledGains(unsettledUserGains);
    }
  };

  const windowCalculations = (which) => {
    if (!currentBlock) return;
    if (!firstBlock) return;
    if (!windowDuration) return;

    var offset = 0;

    switch (which) {
      case 'Opened':
        offset = 0;        
        break;
      case 'Ongoing':
        offset = 1;
        break;
      case 'Finalized':
        offset = 2;
        break;
      default:
    }

    const _windowNumber = Math.floor( (currentBlock.number - firstBlock) / windowDuration + 1 - offset );
    const _windowStartingBlock = firstBlock + (_windowNumber - 1) * windowDuration;
    const _windowEndingBlock = Math.floor( firstBlock + _windowNumber * windowDuration - 1 );

    return {
      windowNumber: _windowNumber,
      startingBlock: _windowStartingBlock,
      endingBlock: _windowEndingBlock
    };
  };

  const weiToCurrency = (value, asFloat = true) => {
    if (!value) return;
    const valueInCurrency = drizzle.web3.utils.fromWei(value, global.config.currencyRequestValue);
    return (asFloat) ? parseFloat(valueInCurrency) : valueInCurrency;
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
