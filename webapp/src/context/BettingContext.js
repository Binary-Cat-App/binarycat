import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { useWeb3React } from '@web3-react/core';

import { differenceInDays } from 'date-fns';
import _ from 'lodash';

import { io } from 'socket.io-client';

// Contracts
import BinaryBet from '../contracts/avax/BinaryBet.json';
import KittyPool from '../contracts/avax/KittyPool.json';
import BinToken from '../contracts/avax/BinToken.json';
import DailyContract from '../contracts/avax/DailyPool.json';
import FlipContract from '../contracts/eth/Flip.json';
import Networks from '../networks.json';

import { useHistory } from 'react-router-dom';

const BettingContext = createContext();

export const useBetting = () => {
  return useContext(BettingContext);
};

export const CURRENCY_AVAX = 'AVAX';
export const CURRENCY_KITTY = 'KITTY';
export const CURRENCY_ETH = 'ETH';

export const BettingProvider = ({ children, currency, timeWindow }) => {
  const { active, account, library } = useWeb3React();
  const history = useHistory();

  const web3Eth = library.eth;
  const web3Utils = library.utils;
  const blocksRange = 1500;

  // Available Contracts
  const avaxContract = new web3Eth.Contract(BinaryBet.abi, BinaryBet.address);
  const kittyContract = new web3Eth.Contract(KittyPool.abi, KittyPool.address);
  const tokenContract = new web3Eth.Contract(BinToken.abi, BinToken.address);
  const ethContract = new web3Eth.Contract(
    FlipContract.abi,
    FlipContract.address
  );
  const dailyContract = new web3Eth.Contract(
    DailyContract.abi,
    DailyContract.address
  );

  const [contract, setContract] = useState(null);
  const [selectedCurrency, selectCurrency] = useState(null);
  const [selectedWindowTime, selectWindowTime] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [unsettledBets, setUnsettledBets] = useState(0);
  const [unsettledWins, setUnsettledWins] = useState(0);
  const [unsettledGains, setUnsettledGains] = useState(0);
  const [unsettledKITTY, setUnsettledKITTY] = useState(0);

  const [currentTimestamp, setCurrentTimestamp] = useState(null);
  const [initTimestamp, setInitTimestamp] = useState(null);
  const [windowDuration, setWindowDuration] = useState(null);
  const [windowNumber, setWindowNumber] = useState(null);
  const [progress, setProgress] = useState(100);
  const [isOpenForBetting, setIsOpenForBetting] = useState(true);
  const [isBetPlaced, setIsBetPlaced] = useState(false);
  const [historicalChartData, setHistoricalChartData] = useState([]);
  // Bet permissions (for toher currencies different from AVAX)
  const [userAllowance, setUserAllowance] = useState(1);

  // Realtime Currency Rates Socket data
  const [socketData, setSocketData] = useState([]);

  const changeContract = async () => {
    if (!selectedCurrency || !selectedWindowTime) return;
    if (selectedCurrency === CURRENCY_AVAX) {
      setContract(avaxContract);
    } else if (selectedCurrency === CURRENCY_KITTY) {
      if (selectedWindowTime === 5) {
        setContract(kittyContract);
      } else if (selectedWindowTime === 1440) {
        setContract(dailyContract);
      }
    } else if (selectedCurrency === CURRENCY_ETH) {
      setContract(ethContract);
    }
  };

  useEffect(() => {
    if (!account || !contract) return;
    if (
      selectedCurrency !== CURRENCY_AVAX &&
      selectedCurrency !== CURRENCY_ETH
    ) {
      checkContractAllownce();
    }
  }, [account, contract]);

  const checkNetwork = async () => {
    let chainId = await web3Eth.net.getId();
    if (!selectedCurrency) {
      return;
    }
    console.log(selectedCurrency);

    if (
      selectedCurrency === CURRENCY_ETH &&
      chainId != Networks['eth'].chainId
    ) {
      changeNetwork();
    } else if (
      (selectedCurrency === CURRENCY_AVAX ||
        selectedCurrency === CURRENCY_KITTY) &&
      chainId != Networks['avax'].chainId
    ) {
      changeNetwork();
    }
  };

  useEffect(() => {
    checkNetwork();
    configTimes();
  }, [contract]);

  const configTimes = () => {
    if (!selectedWindowTime) return;
    if (selectedWindowTime === 5) {
      avaxContract.methods
        .windowDuration()
        .call()
        .then((response) => setWindowDuration(Number.parseInt(response)));
      avaxContract.methods
        .deployTimestamp()
        .call()
        .then((response) => setInitTimestamp(Number.parseInt(response)));
    } else if (selectedCurrency != CURRENCY_ETH) {
      dailyContract.methods
        .windowDuration()
        .call()
        .then((response) => setWindowDuration(Number.parseInt(response)));
      dailyContract.methods
        .deployTimestamp()
        .call()
        .then((response) => setInitTimestamp(Number.parseInt(response)));
    } else {
      ethContract.methods
        .windowDuration()
        .call()
        .then((response) => setWindowDuration(Number.parseInt(response)));
      ethContract.methods
        .deployTimestamp()
        .call()
        .then((response) => setInitTimestamp(Number.parseInt(response)));
    }
  };

  // INIT
  useEffect(() => {
    console.log('Initializing...');
    if (currency) {
      selectCurrency(currency);
      return;
    }
    // Check for the last defined currency
    let lastSelected = localStorage.getItem('selectedCurrency');
    if (lastSelected && lastSelected != CURRENCY_ETH) {
      changeCurrency(lastSelected);
    } else {
      selectCurrency(CURRENCY_AVAX);
    }
  }, []);

  // When currency changes
  useEffect(() => {
    if (!selectedCurrency) return;
    // Save the currency
    if (selectedCurrency) {
      localStorage.setItem('selectedCurrency', selectedCurrency);
    }
    let windows = global.currencyConfiguration.timeOptions[selectedCurrency];
    var targetWindowTime;
    // Verifica se esta em um path específico
    if (timeWindow) {
      targetWindowTime = timeWindow;
    } else {
      // Tries to get last time window selected
      targetWindowTime = Number.parseInt(
        localStorage.getItem('selectedWindowTime')
      );
    }
    if (targetWindowTime) {
      // Verifica se o selecionado é aceito na currency selecionada
      if (windows.filter((w) => w.value === targetWindowTime).length > 0) {
        selectWindowTime(targetWindowTime);
      } else {
        let value = windows[0].value;
        selectWindowTime(value);
      }
    } else {
      let value = windows[0].value;
      // If value didnt change, change the contract
      if (value === selectedWindowTime) {
        // selectWindowTime(value);
        changeContract();
      } else {
        selectWindowTime(value);
      }
    }
  }, [selectedCurrency]);

  const changeCurrency = (currency) => {
    let currecnyPath = currency.toLowerCase();
    history.push('/' + currecnyPath);
    localStorage.removeItem('selectedWindowTime');
    selectCurrency(currency);
  };

  const changeTimeWindow = (timeWindow) => {
    var timeWindowPath;
    if (selectedCurrency === CURRENCY_AVAX) {
      timeWindowPath = 'avax';
    } else if (selectedCurrency === CURRENCY_KITTY && timeWindow === 5) {
      timeWindowPath = 'kitty';
    } else if (selectedCurrency === CURRENCY_KITTY) {
      timeWindowPath = 'daily';
    } else {
      timeWindowPath = 'eth';
    }
    localStorage.setItem('selectedWindowTime', timeWindow);
    history.push('/' + timeWindowPath);
    selectWindowTime(timeWindow);
  };

  // When window time changes
  useEffect(() => {
    if (selectedWindowTime) {
      localStorage.setItem('selectedTimeWindow', selectedWindowTime);
    }
    changeContract();
  }, [selectedWindowTime]);

  // Open for betting data
  const [openedWindowData, setOpenedWindowData] = useState({
    windowNumber: 0,
    startingTimestamp: 0,
    endingTimestamp: 0,
  });
  const [openedPricesData, setOpenedPricesData] = useState({
    initialPrice: '',
    finalPrice: '',
  });
  const [openedPoolData, setOpenedPoolData] = useState({
    betAmount: '0.00',
    betAmountUp: '0.00',
    betAmountDown: '0.00',
    betDirection: '',
    poolTotalUp: '0.00',
    poolTotalDown: '0.00',
    poolSize: '0.00',
    userBets: 0,
  });
  const [openedAccountsData, setOpenedAccountsData] = useState({
    accounts: 0,
  });

  // Ongoing data
  const [ongoingWindowData, setOngoingWindowData] = useState({
    windowNumber: 0,
    startingTimestamp: 0,
    endingTimestamp: 0,
  });
  const [ongoingWindowChartData, setOngoingWindowChartData] = useState([]);
  const [ongoingPricesData, setOngoingPricesData] = useState({
    initialPrice: '0.00',
    finalPrice: '',
  });
  const [ongoingPoolData, setOngoingPoolData] = useState({
    betAmount: '0.00',
    betAmountUp: '0.00',
    betAmountDown: '0.00',
    betDirection: '',
    poolTotalUp: '0.00',
    poolTotalDown: '0.00',
    poolSize: '0.00',
    userBets: 0,
  });
  const [ongoingAccountsData, setOngoingAccountsData] = useState({
    accounts: 0,
  });

  // Finalized data
  const [finalizedWindowData, setFinalizedWindowData] = useState({
    windowNumber: 0,
    startingTimestamp: 0,
    endingTimestamp: 0,
  });
  const [finalizedWindowChartData, setFinalizedWindowChartData] = useState([]);
  const [finalizedPricesData, setFinalizedPricesData] = useState({
    initialPrice: '0.00',
    finalPrice: '0.00',
  });
  const [finalizedPoolData, setFinalizedPoolData] = useState({
    betAmount: '0.00',
    betAmountUp: '0.00',
    betAmountDown: '0.00',
    betDirection: '',
    poolTotalUp: '0.00',
    poolTotalDown: '0.00',
    poolSize: '0.00',
    userBets: 0,
  });
  const [finalizedAccountsData, setFinalizedAccountsData] = useState({
    accounts: 0,
  });

  // Resets
  const initPoolData = {
    betAmount: '0.00',
    betAmountUp: '0.00',
    betAmountDown: '0.00',
    betDirection: '',
    poolTotalUp: '0.00',
    poolTotalDown: '0.00',
    poolSize: '0.00',
    userBets: 0,
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

  const prevWindowNumber = usePrevious(windowNumber);
  const prevOpenedWindowData = usePrevious(openedWindowData);
  const prevOngoingWindowData = usePrevious(ongoingWindowData);

  // Gets Current Timestamp
  useEffect(() => {
    if (active && account) {
      var timer = setInterval(
        () => setCurrentTimestamp(Math.floor(Date.now() / 1000)),
        1000
      );
      return function cleanup() {
        clearInterval(timer);
      };
    }
  }, []);

  // Calculate Totals
  useEffect(() => {
    if (active && account) {
      totalsPrecalculations();
    }
  }, [currentTimestamp]);

  // Windows data
  useEffect(() => {
    if (!active || !contract) return;

    const openedWindow = windowCalculations('Opened');
    const ongoingWindow = windowCalculations('Ongoing');
    const finalizedWindow = windowCalculations('Finalized');

    if (openedWindow && ongoingWindow && finalizedWindow && currentTimestamp) {
      // Reset data
      if (Number(openedWindow.startingTimestamp) === Number(currentTimestamp)) {
        setOpenedPoolData(initPoolData);
        setIsOpenForBetting(true);
        setIsBetPlaced(false);
      }

      if (prevWindowNumber !== openedWindow.windowNumber) {
        setWindowNumber(openedWindow.windowNumber);

        setOpenedWindowData({
          windowNumber: openedWindow.windowNumber,
          startingTimestamp: openedWindow.startingTimestamp,
          endingTimestamp: openedWindow.endingTimestamp,
        });

        setOngoingWindowData({
          windowNumber: ongoingWindow.windowNumber,
          startingTimestamp: ongoingWindow.startingTimestamp,
          endingTimestamp: ongoingWindow.endingTimestamp,
        });

        setFinalizedWindowData({
          windowNumber: finalizedWindow.windowNumber,
          startingTimestamp: finalizedWindow.startingTimestamp,
          endingTimestamp: finalizedWindow.endingTimestamp,
        });
      }

      updatePoolValuesForWindow('Opened', openedWindow.windowNumber);

      if (Number(openedWindow.endingTimestamp) > Number(currentTimestamp)) {
        updatePricesForWindow('Ongoing', ongoingWindow.windowNumber);
        updatePricesForWindow('Finalized', finalizedWindow.windowNumber);

        updatePoolValuesForWindow('Ongoing', ongoingWindow.windowNumber);
        updatePoolValuesForWindow('Finalized', finalizedWindow.windowNumber);
      } else {
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
  }, [currentTimestamp]);

  // Charts Data
  useEffect(() => {
    const startDate = new Date(openedWindowData.startingTimestamp * 1000);
    const endDate = new Date(openedWindowData.endingTimestamp * 1000);

    const dayDifference = differenceInDays(endDate, startDate);

    const shouldFetchPrices =
      openedWindowData.startingTimestamp !== 0 &&
      openedWindowData.startingTimestamp !==
        prevOpenedWindowData.startingTimestamp &&
      openedWindowData.startingTimestamp !== openedWindowData.endingTimestamp &&
      dayDifference <= 1;

    if (shouldFetchPrices) {
      window
        .fetch(`${global.config.currencyRatesNodeAPI}/api/prices`, {
          method: 'post',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: openedWindowData.startingTimestamp,
            to: openedWindowData.endingTimestamp,
          }),
        })
        .then((res) => res.json())
        .then((result) => {
          if (result.result.length > 0) {
            var _priceRange = [];

            if (
              parseFloat(ongoingPricesData.initialPrice) !== 0 &&
              openedWindowData
            ) {
              _priceRange = [
                {
                  _id: 'initial',
                  time: openedWindowData.startingTimestamp,
                  rate: ongoingPricesData.initialPrice,
                },
              ];
            }

            setOngoingWindowChartData([...result.result, ..._priceRange]);
          }
        });
    }
  }, [windowNumber, openedWindowData, ongoingPricesData]);

  useEffect(() => {
    if (
      ongoingWindowData.startingTimestamp !== 0 &&
      ongoingWindowData.endingTimestamp !==
        prevOngoingWindowData.endingTimestamp &&
      ongoingWindowData.startingTimestamp !== ongoingWindowData.endingTimestamp
    ) {
      window
        .fetch(`${global.config.currencyRatesNodeAPI}/api/prices`, {
          method: 'post',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: ongoingWindowData.startingTimestamp,
            to: ongoingWindowData.endingTimestamp,
          }),
        })
        .then((res) => res.json())
        .then((result) => {
          if (result.result.length > 0) {
            var _priceRange = [];

            if (
              parseFloat(finalizedPricesData.initialPrice) !== 0 &&
              parseFloat(finalizedPricesData.finalPrice) !== 0 &&
              ongoingWindowData
            ) {
              _priceRange = [
                {
                  _id: 'initial',
                  time: ongoingWindowData.startingTimestamp,
                  rate: finalizedPricesData.initialPrice,
                },
                {
                  _id: 'final',
                  time: ongoingWindowData.endingTimestamp,
                  rate: finalizedPricesData.finalPrice,
                },
              ];
            }

            setFinalizedWindowChartData([...result.result, ..._priceRange]);
          }
        });
    }
  }, [windowNumber, ongoingWindowData, finalizedPricesData]);

  // Combined Chart Data
  React.useEffect(() => {
    const today = new Date();
    const nextdate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );
    const prevdate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 1
    );
    const selectFrom = prevdate.getTime() / 1000;
    const selectTo = nextdate.getTime() / 1000;

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
        if (result.result.length > 0) {
          setHistoricalChartData(result.result);
        }
      });
  }, []);

  // Socket for Realtime Currency Rate data
  React.useEffect(() => {
    const socket = io(global.config.currencyRatesNodeAPI);
    socket.on('socket-message', (payload) => {
      if (payload.data) {
        setSocketData([payload.data]);
      }
    });
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
    if (!currentTimestamp) return;
    if (!windowDuration) return;
    if (!initTimestamp) return;
    if (!windowNumber) return;

    const start = initTimestamp + (windowNumber - 1) * windowDuration;
    const _progress = 100 - ((currentTimestamp - start) / windowDuration) * 100;
    setProgress(_progress);
  }, [currentTimestamp, windowNumber]);

  // Open for betting
  useEffect(() => {
    setIsOpenForBetting(true);
  }, [currentTimestamp, windowNumber, openedPoolData]);

  // initialPrice , finalPrice
  const updatePricesForWindow = async (where, _windowNumber) => {
    if (active && contract) {
      if (Number.isInteger(_windowNumber) === false) return;

      var targetContract = null;
      if (selectedWindowTime === 5) {
        targetContract = avaxContract;
      } else {
        targetContract = contract;
      }

      var prices;
      var initialPrice;
      var finalPrice;

      if (selectedWindowTime === 5) {
        prices = await getPastEvents(
          targetContract,
          _windowNumber,
          'PriceUpdated'
        );

        initialPrice =
          prices.length > 0 ? prices[0].returnValues.price / 100000000 : '0.00';
        finalPrice =
          where === 'Finalized' && prices.length > 1
            ? prices[1].returnValues.price / 100000000
            : '0.00';
      } else {
        prices = await getPrices(_windowNumber);
        if (selectedCurrency === CURRENCY_ETH) {
          initialPrice =
            prices[0] > 0 ? prices[0] / 1000000000000000000000000000 : '0.00';
          finalPrice =
            where === 'Finalized' && prices[1] > 1
              ? prices[1] / 1000000000000000000000000000
              : '0.00';
        } else {
          initialPrice = prices[0] > 0 ? prices[0] / 100000000 : '0.00';
          finalPrice =
            where === 'Finalized' && prices[1] > 1
              ? prices[1] / 100000000
              : '0.00';
        }
      }
      switch (where) {
        case 'Ongoing':
          if (
            parseFloat(initialPrice) !==
            parseFloat(ongoingPricesData.initialPrice)
          ) {
            setOngoingPricesData({ initialPrice, finalPrice });
          }
          break;

        case 'Finalized':
          if (
            parseFloat(initialPrice) !==
              parseFloat(finalizedPricesData.initialPrice) ||
            parseFloat(finalPrice) !==
              parseFloat(finalizedPricesData.finalPrice)
          ) {
            setFinalizedPricesData({ initialPrice, finalPrice });
          }
          break;

        default:
      }
    }
  };

  const updatePoolValuesForWindow = async (where, _windowNumber) => {
    if (active) {
      if (isNaN(_windowNumber)) return;

      var _betAmount = 0;
      var _betAmountUp = 0.0;
      var _betAmountDown = 0.0;
      var _betDirection = '';
      var _poolSize = 0;
      var _poolTotalUp = 0;
      var _poolTotalDown = 0;
      var _userBets = 0;

      const poolValues = await getPoolValues(_windowNumber);

      _poolTotalUp = weiToCurrency(poolValues[1]);
      _poolTotalDown = weiToCurrency(poolValues[0]);
      _poolSize = _poolTotalUp + _poolTotalDown;

      const userBetAmounts = await getUserBets(_windowNumber, account);
      _betAmountUp = weiToCurrency(userBetAmounts[1]);
      _betAmountDown = weiToCurrency(userBetAmounts[0]);
      _betAmount = _betAmountUp + _betAmountDown;

      if (_betAmountUp > 0 && _betAmountDown === 0) {
        _betDirection = 'up';
      } else if (_betAmountUp === 0 && _betAmountDown > 0) {
        _betDirection = 'down';
      } else if (_betAmountUp > 0 && _betAmountDown > 0) {
        _betDirection = 'both';
      }

      _poolTotalUp = _poolTotalUp.toFixed(2);
      _poolTotalDown = _poolTotalDown.toFixed(2);
      _poolSize = _poolSize.toFixed(2);
      _betAmountUp = _betAmountUp.toFixed(2);
      _betAmountDown = _betAmountDown.toFixed(2);
      _betAmount = _betAmount.toFixed(2);

      updatePoolAndAccountsData(where, {
        accounts: [],
        _betAmount,
        _betAmountUp,
        _betAmountDown,
        _betDirection,
        _poolTotalUp,
        _poolTotalDown,
        _poolSize,
        _userBets,
      });
    }
  };

  const updatePoolAndAccountsData = (key, details) => {
    switch (key) {
      case 'Opened':
        if (
          // Check if something changed
          parseFloat(openedPoolData.betAmount) !==
            parseFloat(details._betAmount) ||
          parseFloat(openedPoolData.betAmountUp) !==
            parseFloat(details._betAmountUp) ||
          parseFloat(openedPoolData.betAmountDown) !==
            parseFloat(details._betAmountDown) ||
          parseFloat(openedPoolData.userBets) !==
            parseFloat(details.userBets) ||
          openedPoolData.betDirection !== details._betDirection ||
          parseFloat(openedPoolData.poolTotalUp) !==
            parseFloat(details._poolTotalUp) ||
          parseFloat(openedPoolData.poolTotalDown) !==
            parseFloat(details._poolTotalDown) ||
          parseFloat(openedPoolData.poolSize) !== parseFloat(details._poolSize)
        ) {
          setOpenedPoolData(
            // TODO: Substituir com o numero de apostas
            true
              ? {
                  betAmount: details._betAmount,
                  betAmountUp: details._betAmountUp,
                  betAmountDown: details._betAmountDown,
                  betDirection: details._betDirection,
                  poolTotalUp: details._poolTotalUp,
                  poolTotalDown: details._poolTotalDown,
                  poolSize: details._poolSize,
                  userBets: details._userBets,
                }
              : initPoolData
          );
        }

        if (Number(openedAccountsData.accounts) !== details.accounts.length) {
          setOpenedAccountsData({
            accounts: details.accounts.length,
          });
        }

        break;

      case 'Ongoing':
        if (
          // Check if something changed
          parseFloat(ongoingPoolData.betAmount) !==
            parseFloat(details._betAmount) ||
          parseFloat(ongoingPoolData.betAmountUp) !==
            parseFloat(details._betAmountUp) ||
          parseFloat(ongoingPoolData.betAmountDown) !==
            parseFloat(details._betAmountDown) ||
          parseFloat(ongoingPoolData.userBets) !==
            parseFloat(details.userBets) ||
          ongoingPoolData.betDirection !== details._betDirection ||
          parseFloat(ongoingPoolData.poolTotalUp) !==
            parseFloat(details._poolTotalUp) ||
          parseFloat(ongoingPoolData.poolTotalDown) !==
            parseFloat(details._poolTotalDown) ||
          parseFloat(ongoingPoolData.poolSize) !== parseFloat(details._poolSize)
        ) {
          setOngoingPoolData(
            // TODO: Substituir com o numero de apostas
            true
              ? {
                  betAmount: details._betAmount,
                  betAmountUp: details._betAmountUp,
                  betAmountDown: details._betAmountDown,
                  betDirection: details._betDirection,
                  poolTotalUp: details._poolTotalUp,
                  poolTotalDown: details._poolTotalDown,
                  poolSize: details._poolSize,
                  userBets: details._userBets,
                }
              : initPoolData
          );
        }

        if (Number(ongoingAccountsData.accounts) !== details.accounts.length) {
          setOngoingAccountsData({
            accounts: details.accounts.length,
          });
        }

        break;

      case 'Finalized':
        if (
          // Check if something changed
          parseFloat(finalizedPoolData.betAmount) !==
            parseFloat(details._betAmount) ||
          parseFloat(finalizedPoolData.betAmountUp) !==
            parseFloat(details._betAmountUp) ||
          parseFloat(finalizedPoolData.betAmountDown) !==
            parseFloat(details._betAmountDown) ||
          parseFloat(finalizedPoolData.userBets) !==
            parseFloat(details.userBets) ||
          finalizedPoolData.betDirection !== details._betDirection ||
          parseFloat(finalizedPoolData.poolTotalUp) !==
            parseFloat(details._poolTotalUp) ||
          parseFloat(finalizedPoolData.poolTotalDown) !==
            parseFloat(details._poolTotalDown) ||
          parseFloat(finalizedPoolData.poolSize) !==
            parseFloat(details._poolSize)
        ) {
          setFinalizedPoolData(
            // TODO: Substituir com o numero de apostas
            true
              ? {
                  betAmount: details._betAmount,
                  betAmountUp: details._betAmountUp,
                  betAmountDown: details._betAmountDown,
                  betDirection: details._betDirection,
                  poolTotalUp: details._poolTotalUp,
                  poolTotalDown: details._poolTotalDown,
                  poolSize: details._poolSize,
                  userBets: details._userBets,
                }
              : initPoolData
          );
        }

        if (
          Number(finalizedAccountsData.accounts) !== details.accounts.length
        ) {
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
    if (active && contract) {
      var unsettledUserBets = 0;
      var unsettledUserWins = 0;
      var unsettledUserGains = 0n;
      var unsettledUserKITTY = 0;

      // Recupera quantas apostas esse usuario fez no contrato
      const unsettledBetsCount = await contract.methods
        .betListLen(account)
        .call({
          from: account,
        })
        .then((response) => response);
      if (unsettledBetsCount > 0) {
        // unsettledBetsCount is the length of the unsettledBets array
        for (let i = 0; i < unsettledBetsCount; i++) {
          // Para cada aposta, recupera o id da janela
          const userBetList = await contract.methods
            .getUserBetList(account, i)
            .call({
              from: account,
            })
            .then((response) => response);

          if (userBetList > 0) {
            // userBetList is BettingWindow #
            var targetContract = null;
            if (selectedWindowTime === 5) {
              targetContract = avaxContract;
            } else {
              targetContract = contract;
            }
            const windowBetPrices = await targetContract.methods
              .getWindowBetPrices(userBetList)
              .call({
                from: account,
              })
              .then((response) => response);
            if (windowBetPrices) {
              const prices = Object.values(windowBetPrices);
              prices[0] = parseInt(prices[0]);
              prices[1] = parseInt(prices[1]);

              if (prices[0] !== 0 && prices[1] !== 0) {
                unsettledUserBets = unsettledUserBets + 1;

                // 0 = Down, 1 = Up, 2 = Tie
                const priceDirection =
                  prices[0] > prices[1] ? 0 : prices[0] < prices[1] ? 1 : 2;

                const userStake = await contract.methods
                  .getUserStake(userBetList, account)
                  .call({
                    from: account,
                  })
                  .then((response) => response);

                if (userStake) {
                  const userBet = Object.values(userStake);

                  const windowPoolValues = await contract.methods
                    .getPoolValues(userBetList)
                    .call({
                      from: account,
                    })
                    .then((response) => response);

                  if (windowPoolValues) {
                    const poolValues = Object.values(windowPoolValues);
                    const settledBet = await contract.methods
                      .settleBet(
                        userBet[1],
                        userBet[0],
                        poolValues[1],
                        poolValues[0],
                        priceDirection
                      )
                      .call({
                        from: account,
                      })
                      .then((response) => response);

                    if (settledBet) {
                      var gain;
                      if (contract._address === dailyContract._address) {
                        gain = BigInt(settledBet);
                      } else {
                        gain = BigInt(settledBet.gain);
                      }

                      if (gain > 0) {
                        unsettledUserWins = unsettledUserWins + 1;
                        unsettledUserGains = unsettledUserGains + gain;
                      }

                      let userBet0 = weiToCurrency(userBet[0]);
                      let userBet1 = weiToCurrency(userBet[1]);
                      let poolValues0 = weiToCurrency(poolValues[0]);
                      let poolValues1 = weiToCurrency(poolValues[1]);

                      if (selectedCurrency === CURRENCY_AVAX) {
                        unsettledUserKITTY =
                          unsettledUserKITTY +
                          (200 * (userBet0 + userBet1)) /
                            (poolValues0 + poolValues1);
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
      setUnsettledGains(unsettledUserGains.toString());
      setUnsettledKITTY(unsettledUserKITTY);
    }
  };

  const windowCalculations = (which) => {
    if (!currentTimestamp) return;
    if (!initTimestamp) return;
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

    var _windowNumber = Math.floor(
      (currentTimestamp - initTimestamp) / windowDuration + 1 - offset
    );
    if (_windowNumber < 0) {
      _windowNumber = 0;
    }

    const _windowStartingTimestamp =
      initTimestamp + (_windowNumber - 1) * windowDuration;

    const _windowEndingTimestamp = Math.floor(
      initTimestamp + _windowNumber * windowDuration - 1
    );

    return {
      windowNumber: _windowNumber,
      startingTimestamp: _windowStartingTimestamp,
      endingTimestamp: _windowEndingTimestamp,
    };
  };

  const weiToCurrency = (value, asFloat = true) => {
    if (!value) return;
    const valueInCurrency = web3Utils.fromWei(
      value,
      global.config.currencyRequestValue
    );
    return asFloat ? parseFloat(valueInCurrency) : valueInCurrency;
  };

  const currencyToWei = (value, asBigInt = false) => {
    if (!value) return;
    let cleanVlue = value.replace(' ', '');
    const valueInWei = web3Utils.toWei(
      cleanVlue,
      global.config.currencyRequestValue
    );
    return asBigInt ? BigInt(valueInWei) : valueInWei;
  };

  const checkContractAllownce = () => {
    if (!contract) return;
    // User Allowance
    tokenContract.methods
      .allowance(account, contract._address)
      .call({
        from: account,
      })
      .then((response) => {
        setUserAllowance(response);
      });
  };

  const contractPermissionRequested = async () => {
    const amount = currencyToWei(Number.MAX_SAFE_INTEGER + '');

    const allowance = await tokenContract.methods
      .approve(contract._address, amount)
      .send({
        from: account,
      })
      .then(() => {
        checkContractAllownce();
      });
  };

  // MARK: Currency contract interation
  const getPastEvents = async (selectedContract, windowNumber, event) => {
    let blockNumber = await library.eth.getBlockNumber();
    let result = await selectedContract
      .getPastEvents(event, {
        filter: { windowNumber: [windowNumber + 1, windowNumber + 2] },
        fromBlock: blockNumber - 2000,
        toBlock: 'latest',
      })
      .then((result) => result);
    return result;
  };

  const getPrices = async (windowNumber) => {
    const result = await contract.methods
      .getWindowBetPrices(windowNumber)
      .call()
      .then((result) => result);

    return result;
  };

  const getUserBets = async (windowNumber, address) => {
    const result = await contract.methods
      .getUserStake(windowNumber, address)
      .call()
      .then((result) => result);
    return result;
  };

  const getPoolValues = async (windowNumber) => {
    const result = await contract.methods
      .getPoolValues(windowNumber)
      .call()
      .then((result) => result);
    return result;
  };

  const changeNetwork = async () => {
    let network = Networks[selectedCurrency.toLowerCase()];
    let chainId = network.chainId;
    let chainName = network.chainName;
    let currency = network.currency;
    let rpcURL = network.rpcUrl;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: web3Utils.toHex(chainId) }],
      });
      window.location.reload(false);
    } catch (err) {
      // This error code indicates that the chain has not been added to MetaMask
      if (err.code === 4902) {
        await window.ethereum
          .request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName: chainName,
                chainId: web3Utils.toHex(chainId),
                nativeCurrency: currency,
                rpcUrls: [rpcURL],
              },
            ],
          })
          .then(() => {
            changeNetwork();
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }
  };

  const value = {
    currentTimestamp,
    active,
    account,
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
    unsettledGains,
    unsettledKITTY,
    weiToCurrency,
    currencyToWei,
    web3Eth,
    web3Utils,
    contract,
    tokenContract,
    selectedCurrency,
    selectedWindowTime,
    changeCurrency,
    changeTimeWindow,
    userAllowance,
    contractPermissionRequested,
  };

  return (
    <BettingContext.Provider value={value}>{children}</BettingContext.Provider>
  );
};
