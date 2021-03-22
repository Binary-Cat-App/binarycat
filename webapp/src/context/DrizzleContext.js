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
  const [openedPricesData, setOpenedPricesData] = useState ({
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
  }
  const initAccountsData = {
    accounts: 0,
  }

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
    drizzleReadinessState.drizzleState
  ]);

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
          filter: {user: ethAccount},
          fromBlock: 0,
          toBlock: 'latest'
        }
      )
      .then(function(result){
        if (result.length > 0) {
          var totalGain = 0;
          
          result.forEach(
            element => 
              totalGain += Number.parseInt(element.returnValues.gain)
          );
          
          setTotalWinnings(
            weiToCurrency(totalGain.toString())
          );

          const wins = result.filter(
            key => 
              Number.parseInt(key.returnValues.gain) > 0
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
    drizzleReadinessState.drizzleState
  ]);

  // Deposit update
  useEffect(() => {
    if (drizzleReadinessState.loading === false) {
      const contract = drizzle.contracts.BinaryBet;
      const web3 = drizzle.web3;
      const contractWeb3 = new web3.eth.Contract(
        contract.abi,
        contract.address
      );
      contractWeb3.events.newDeposit(
        {
          filter: {user: ethAccount},
          fromBlock: 'latest'
        }
      )
      .on("connected", function(subscriptionId){
        //console.log(subscriptionId);
      })
      .on('data', function(event){
        console.log(event); // same results as the optional callback above
      })
      .on('error', console.error);
    }
  }, [
    drizzleReadinessState.loading, 
    drizzle.web3, 
    drizzleReadinessState.drizzleState
  ]);

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

    // Reset data
    if ( openedWindowStartingBlock === currentBlock.number) {
      setOpenedPoolData(initPoolData);
    }

    // Current Window Number
    setWindowNumber(openedWindow);

    setOpenedWindowData({
      windowNumber: openedWindow,
      startingBlock: openedWindowStartingBlock,
      endingBlock: currentBlock.number,
    });

    updatePoolValuesForWindow('Opened', openedWindowStartingBlock, currentBlock.number);
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
    
    updatePricesForWindow('Ongoing', ongoingWindow);
    updatePoolValuesForWindow('Ongoing', ongoingWindowStartingBlock, ongoingWindowEndingBlock);
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

    updatePricesForWindow('Finalized', finalizedWindow);
    updatePoolValuesForWindow('Finalized', finalizedWindowStartingBlock, finalizedWindowEndingBlock);
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
  const updatePricesForWindow = (where, _windowNumber) => {
    if (drizzleReadinessState.loading === false) {
      const contract = drizzle.contracts.BinaryBet;
      const web3 = drizzle.web3;
      const contractWeb3 = new web3.eth.Contract(
        contract.abi,
        contract.address
      );
      contractWeb3.getPastEvents(
        'priceUpdated', 
        {
          filter: {windowNumber: [_windowNumber+1, _windowNumber+2]},
          fromBlock: 0,
          toBlock: 'latest'
        }
      )
      .then(function(result){
        if (where === 'Ongoing') {
          const initialPrice = (result.length > 0) ? Number(result[0].returnValues.price).toFixed(2) : '0.00';
          const finalPrice = '0.00';
          setOngoingPricesData({initialPrice, finalPrice});
        }
        else if (where === 'Finalized') {
          const initialPrice = (result.length > 0) ? Number(result[0].returnValues.price).toFixed(2) : '0.00';
          const finalPrice = (result.length > 1) ? Number(result[1].returnValues.price).toFixed(2) : '0.00';
          setFinalizedPricesData({initialPrice, finalPrice});
        }
      });
    }
  };

  const updatePoolValuesForWindow = (where, startingBlock, endingBlock) => {
    if (drizzleReadinessState.loading === false) {
      const contract = drizzle.contracts.BinaryBet;
      const web3 = drizzle.web3;
      const contractWeb3 = new web3.eth.Contract(
        contract.abi,
        contract.address
      );
      contractWeb3.getPastEvents(
        'newBet', 
        {
          fromBlock: startingBlock,
          toBlock: endingBlock
        }
      )
      .then(function(result){

        if (result.length > 0) {
          // poolSize
          var _poolSize = 0;
          result.forEach(element => _poolSize += Number.parseInt(element.returnValues.value));

          // poolTotalUp
          const up = result.filter(key => Number.parseInt(key.returnValues.side) === 1);
          var _poolTotalUp = 0;
          if (up.length > 0) {
            up.forEach(element => _poolTotalUp += Number.parseInt(element.returnValues.value));
          }

          // poolTotalDown
          const down = result.filter(key => Number.parseInt(key.returnValues.side) === 0);
          var _poolTotalDown = 0;
          if (down.length > 0) {
            down.forEach(element => _poolTotalDown += Number.parseInt(element.returnValues.value));
          }

          // user bet amount and direction
          const currentUser = result.filter(key => key.returnValues.user.toLowerCase() === ethAccount.toLowerCase()); 
          var _betAmount = 0;
          var _betDirection = '';
          if (currentUser.length > 0) {
            _betAmount = currentUser[0].returnValues.value;
            _betDirection = (Number.parseInt(currentUser[0].returnValues.side) === 1) ? 'up' : 'down';
          }
        }

        if (where === 'Opened') {
          setOpenedPoolData(
            (result.length > 0) ?
              {
                betAmount: weiToCurrency(_betAmount.toString()),
                betDirection: _betDirection,
                poolTotalUp: weiToCurrency(_poolTotalUp.toString()),
                poolTotalDown: weiToCurrency(_poolTotalDown.toString()),
                poolSize: weiToCurrency(_poolSize.toString())
              }
            : initPoolData
          );
          setOpenedAccountsData({
            accounts: result.length
          });
        }
        else if (where === 'Ongoing') {
          setOngoingPoolData(
            (result.length > 0) ?
              {
                betAmount: weiToCurrency(_betAmount.toString()),
                betDirection: _betDirection,
                poolTotalUp: weiToCurrency(_poolTotalUp.toString()),
                poolTotalDown: weiToCurrency(_poolTotalDown.toString()),
                poolSize: weiToCurrency(_poolSize.toString())
              }
            : initPoolData
          );
          setOngoingAccountsData({
            accounts: result.length
          });
        }
        else if (where === 'Finalized') {
          setFinalizedPoolData(
            (result.length > 0) ?
              {
                betAmount: weiToCurrency(_betAmount.toString()),
                betDirection: _betDirection,
                poolTotalUp: weiToCurrency(_poolTotalUp.toString()),
                poolTotalDown: weiToCurrency(_poolTotalDown.toString()),
                poolSize: weiToCurrency(_poolSize.toString())
              }
            : initPoolData
          );
          setFinalizedAccountsData({
            accounts: result.length
          });
        }
      });
    }
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
    openedPricesData,
    openedPoolData,
    openedAccountsData,
    ongoingWindowData,
    ongoingPricesData,
    ongoingPoolData,
    ongoingAccountsData,
    finalizedWindowData,
    finalizedPricesData,
    finalizedPoolData,
    finalizedAccountsData,
  };

  return (
    <DrizzleContext.Provider value={value}>{children}</DrizzleContext.Provider>
  );
};