import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
    initialPrice: '',
    finalPrice: '',
    poolTotalUp: '0.00',
    poolTotalDown: '0.00',
    poolSize: '0.00',
  };
  const initAccountsData = {
    accounts: 0,
  };

  const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };

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
      
      const balKey = 
        contract.methods['getBalance'].cacheCall(
          drizzleReadinessState.drizzleState.accounts[0]
        );
      const bal =
        drizzleReadinessState.drizzleState.contracts.BinaryBet.getBalance[
          balKey
        ];
      
      if (bal) {
        if (bal.value) {
          const ethBal = weiToCurrency(bal.value.toString());
          // User SmartContract Balance
          setBalance(ethBal + unsettledGains);
        }
      }

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
    drizzleReadinessState.drizzleState,
    unsettledGains
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

      var unsettledUserBets = 0;
      var unsettledUserWins = 0;
      var unsettledUserGains = 0;

      const unsettledBetsCountKey = 
        contract.methods['betListLen'].cacheCall(
          drizzleReadinessState.drizzleState.accounts[0]
        );
      const unsettledBetsCount =
        drizzleReadinessState.drizzleState.contracts.BinaryBet.betListLen[
          unsettledBetsCountKey
        ];
      
      if (unsettledBetsCount) {
        if (unsettledBetsCount.value > 0) {
          
          // unsettledBetsCount.value is the length of the unsettledBets array
          console.log("User Unsettled Bets regardless the WindowPrices:", unsettledBetsCount.value);

          for (let i = 0; i < unsettledBetsCount.value; i++) {

            const userBetListKey = 
              contract.methods['getUserBetList'].cacheCall(
                drizzleReadinessState.drizzleState.accounts[0],
                i
              );
            const userBetList =
              drizzleReadinessState.drizzleState.contracts.BinaryBet.getUserBetList[
                userBetListKey
              ];
            
            if (userBetList) {
              if (userBetList.value > 0) {
                
                // userBetList.value is BettingWindow #

                const windowBetPricesKey = 
                  contract.methods['getWindowBetPrices'].cacheCall(
                    userBetList.value
                  );
                const windowBetPrices =
                  drizzleReadinessState.drizzleState.contracts.BinaryBet.getWindowBetPrices[
                    windowBetPricesKey
                  ];

                if (windowBetPrices) {
                  if (windowBetPrices.value) {
                    const prices = Object.values(windowBetPrices.value)
                    
                    if( prices[0] !== 0 && prices[1] !== 0) {

                      unsettledUserBets = unsettledUserBets + 1;

                      const userStakeKey = 
                        contract.methods['getUserStake'].cacheCall(
                          userBetList.value,
                          drizzleReadinessState.drizzleState.accounts[0]
                        );
                      const userStake =
                        drizzleReadinessState.drizzleState.contracts.BinaryBet.getUserStake[
                          userStakeKey
                        ];

                      // 0 = Down, 1 = Up
                      const priceDirection = ( prices[0] < prices[1] ) ? 1 : 0 ;
                      
                      if (userStake) {
                        if (userStake.value) {
                          const userBet = Object.values(userStake.value);
                          userBet[0] = weiToCurrency(userBet[0].toString());
                          userBet[1] = weiToCurrency(userBet[1].toString());

                          if (userBet[priceDirection] !== 0) {
                            
                            unsettledUserWins = unsettledUserWins + 1;

                            const windowPoolValuesKey = 
                              contract.methods['getPoolValues'].cacheCall(
                                userBetList.value
                              );
                            const windowPoolValues =
                              drizzleReadinessState.drizzleState.contracts.BinaryBet.getPoolValues[
                                windowPoolValuesKey
                              ];

                            if (windowPoolValues) {
                              if (windowPoolValues.value) {
                                const poolValues = Object.values(windowPoolValues.value);
                                poolValues[0] = weiToCurrency(poolValues[0].toString());
                                poolValues[1] = weiToCurrency(poolValues[1].toString());
                                
                                const poolTotal = poolValues[0] + poolValues[1];
                                const gain = ( userBet[priceDirection] * poolTotal ) / poolValues[priceDirection];
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
            }

          }

        }
      }

      console.log("Unsettled Bets for Windows with available Initial/Final prices: ", unsettledUserBets);
      console.log("Unsettled Wins for Windows with available Initial/Final prices: ", unsettledUserWins);
      console.log("Unsettled Gains for Windows with available Initial/Final prices: ", unsettledUserGains);
      console.log("------");
      
      setUnsettledGains(unsettledUserGains);

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

            setTotalWinnings(totalGain + unsettledUserGains);

            const wins = result.filter(
              (key) => weiToCurrency(key.returnValues.gain.toString()) > 0
            );

            if (wins.length > 0) {
              setWinningPercentage(
                Number( 
                  ( ( wins.length + unsettledUserWins ) / ( result.length + unsettledUserBets ) ) * 100
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
    const openedWindowEndingBlock = Math.floor(
      firstBlock + openedWindow * windowDuration - 1
    );

    // Reset data
    if (openedWindowStartingBlock === currentBlock.number) {
      setOpenedPoolData(initPoolData);
      setIsOpenForBetting(true);
      setIsBetPlaced(false);
      setOngoingWindowChartData([]);
    }

    // Current Window Number
    setWindowNumber(openedWindow);

    setOpenedWindowData({
      windowNumber: openedWindow,
      startingBlock: openedWindowStartingBlock,
      endingBlock: openedWindowEndingBlock,
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
    if (
          openedWindowTimestamps.startingBlockTimestamp !== 0 &&
          openedWindowTimestamps.startingBlockTimestamp !== prevOpenedWindowTimestamps.startingBlockTimestamp &&
          openedWindowTimestamps.startingBlockTimestamp !== openedWindowTimestamps.endingBlockTimestamp
    ) {
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
          if(result.result.length > 0) {
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
              ? weiToCurrency((result[0].returnValues.price * 10000000000).toString())
              : '0.00';
          let finalPrice = '0.00';
          if (where === 'Finalized') {
            finalPrice =
              result.length > 1
                ? weiToCurrency((result[1].returnValues.price  * 10000000000).toString())
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