import React, { useEffect, useState, useRef } from 'react';
import { Bet } from './Bet';
import { Loading } from './Loading';
import { UserArea } from './UserArea';
import { BetChart } from './Chart';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { v4 as uuid } from 'uuid';
import { BetProgressBar } from './BetProgressBar';
import { useDrizzle } from '../context/DrizzleContext';
import { useMetaMask } from '../context/MataMaskContext';

const MIN_BET_AMOUNT = 0;
const MAX_CARDS = 4;

const defaultData = {
  blockSize: '#1',
  poolTotalUp: '1.00',
  poolTotalDown: '1.00',
  poolSize: '2.00',
  accounts: '0',
  price: '0',
};

const betSessionPeriod = 10;
const FIRST_BLOCK = 1;
const WINDOW_DURATION = 10;

export const Dashboard = () => {
  const { ethAccount } = useMetaMask();

  const [isLoading] = useState(false);
  const [betSession, setBetSession] = useState(0);
  const [counter, setCounter] = useState(betSessionPeriod);
  const {
    drizzle,
    drizzleReadinessState,
    currentBlock,
    balance,
  } = useDrizzle();
  const [startBlock, setStartBlock] = useState(0);
  const [progressValue, setProgressValue] = useState(100);
  const [currentWindow, setCurrentWindow] = useState(null);
  const [currentWindowValue, setCurrentWindowValue] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const betScrollDiv = useRef(null);
  const [bets, setBets] = useState([]);
  const [isOpenForBetting, setIsOpenForBetting] = useState(true);
  const [firstFetch, setFirstFetch] = useState(true);
  const [transformMove, setTransformMove] = useState(null);
  const [transformAnimation, setTransformAnimation] = useState(null);

  const contract = React.useMemo(() => {
    return drizzle.contracts.BinaryBet;
  }, [drizzle.contracts]);

  useEffect(() => {
    if (currentBlock) {

      // Open For Betting Window
      const windowNumber = Math.floor(
        (currentBlock.number - FIRST_BLOCK) / WINDOW_DURATION + 1
      );
      setCurrentWindow(windowNumber);

      // Progress Bar
      const start = FIRST_BLOCK + (windowNumber - 1) * WINDOW_DURATION;
      const progress =
        100 - ((currentBlock.number - start) / WINDOW_DURATION) * 100;
      setProgressValue(progress);

      // Open For Betting Window Pool Values
      const winKey = contract.methods['getPoolValues'].cacheCall(windowNumber);
      const windowData =
        drizzleReadinessState.drizzleState.contracts.BinaryBet.getPoolValues[
          winKey
        ];
      
      if (windowData) {
        setCurrentWindowValue(windowData.value);
        setFirstFetch(false);
      }

      // Open For Betting Window Current Block
      const betsArr = bets.slice(0);
      const current = betsArr.find((el) => el.status === 'open');
      
      if (current) {
        current.blockSize = currentBlock.number;
      }
      
      setBets(betsArr);

    }
  }, [currentBlock]);


  React.useEffect(() => {
    if (currentBlock) {

      // Reset Cards Train Animation
      setTransformMove({});

      const windowNumber = Math.floor(
        (currentBlock.number - FIRST_BLOCK) / WINDOW_DURATION + 1
      );
      const windowEndingBlock = Math.floor(
        FIRST_BLOCK + (windowNumber - 1) * WINDOW_DURATION - 1
      );
      const windowFinalizedBlock = Math.floor(
        FIRST_BLOCK + (windowNumber - 2) * WINDOW_DURATION - 1
      );

      if (isFirstLoad) {

        // Initialize Cards
        setBets((prev) => [
          {
            ...defaultData,
            status: 'open',
            blockSize: currentBlock.number,
            id: uuid(),
          },
          {
            ...defaultData,
            initialPrice: '0.00',
            finalPrice: '',
            status: 'ongoing',
            blockSize: windowEndingBlock,
            id: uuid(),
          },
          {
            ...defaultData,
            finalPrice: '0.00',
            initialPrice: '0.00',
            status: 'finalized',
            blockSize: windowFinalizedBlock,
            id: uuid(),
          },
          {
            ...defaultData,
            finalPrice: '0.00',
            initialPrice: '0.00',
            status: 'finalized',
            blockSize: windowFinalizedBlock,
            id: uuid(),
          },
        ]);
        
        setIsFirstLoad(false);
      
      } else {

        const prevBets = bets.slice(0);
        const opened = prevBets.find((el) => el.status === 'open'); 
        const ongoing = prevBets.find((el) => el.status === 'ongoing');
        
        // Transforms Current Open For Betting to Ongoing
        opened.status = 'ongoing';
        opened.blockSize = windowEndingBlock;
        opened.initialPrice = '0.00';
        opened.finalPrice = '?';
        
        // Transforms Current Ongoing to Finalized
        ongoing.status = 'finalized';
        ongoing.blockSize = windowFinalizedBlock;
        ongoing.finalPrice = '0.00';
        ongoing.finalPrice = '0.00';

        // Adds New Open For Betting
        prevBets.unshift({
          ...defaultData,
          status: 'open',
          blockSize: currentBlock.number,
          id: uuid(),
        });

        setBets(prevBets);
      }

      // Betting Cycles Counter
      setBetSession((prev) => prev + 1);
      setCounter(betSessionPeriod);
      setIsOpenForBetting(true);

    }
  }, [currentWindow]);


  React.useEffect(() => {
    if (currentWindowValue) {
      const updateBets = bets.slice(0);
      const current = updateBets.find((el) => el.status === 'open');
      if (current) {
        const upValue =
          Math.round(
            drizzle.web3.utils.fromWei(
              currentWindowValue['2'],
              global.config.currencyRequestValue
            ) * 100
          ) / 100;
        const downValue =
          Math.round(
            drizzle.web3.utils.fromWei(
              currentWindowValue['1'],
              global.config.currencyRequestValue
            ) * 100
          ) / 100;
        current.poolTotalUp = Number(upValue).toFixed(2);
        current.poolTotalDown = Number(downValue).toFixed(2);
        current.poolSize = (Number(upValue) + Number(downValue)).toFixed(2);
        // console.log(
        //   'Up value Wei:',
        //   currentWindowValue['2'],
        //   ' ETH: ',
        //   drizzle.web3.utils.fromWei(
        //     currentWindowValue['2'],
        //     global.config.currencyRequestValue
        //   )
        // );
        // console.log(
        //   'Down value Wei:',
        //   currentWindowValue['1'],
        //   'ETH: ',
        //   drizzle.web3.utils.fromWei(
        //     currentWindowValue['1'],
        //     global.config.currencyRequestValue
        //   )
        // );
        setBets(updateBets);
      }
    }
  }, [currentWindowValue]);

/*
  React.useEffect(() => {
    if (!currentWindow || !currentBlock) return;
    const windowNumber = Math.floor(
      (currentBlock.number - FIRST_BLOCK) / WINDOW_DURATION + 1
    );
    const windowEndingBlock = Math.floor(
      FIRST_BLOCK + (windowNumber - 1) * WINDOW_DURATION - 1
    );
    const windowFinalizedBlock = Math.floor(
      FIRST_BLOCK + (windowNumber - 2) * WINDOW_DURATION - 1
    );
    console.log('CALL FOR BLOCKS', windowEndingBlock, windowFinalizedBlock);
    const onGoindDataKey = contract.methods['getPoolValues'].cacheCall(
      windowEndingBlock
    );
    const onGoindData =
      drizzleReadinessState.drizzleState.contracts.BinaryBet.getPoolValues[
        onGoindDataKey
      ];
    const finalizedDataKey = contract.methods['getPoolValues'].cacheCall(
      windowFinalizedBlock
    );
    const finalizedData =
      drizzleReadinessState.drizzleState.contracts.BinaryBet.getPoolValues[
        finalizedDataKey
      ];
    console.log('\n\n\n---DATA', onGoindData, finalizedData);
    if (onGoindData) {
      getValuesFromWei(windowEndingBlock, onGoindData.value);
      getPriceForBlock(onGoindData.value['0'], 'initial', 'ongoing');
      getPriceForBlock(onGoindData.value['3'], 'final', 'ongoing');
    }
    if (finalizedData) {
      getValuesFromWei(windowFinalizedBlock, finalizedData.value);
      getPriceForBlock(finalizedData.value['0'], 'initial', 'finalized');
      getPriceForBlock(finalizedData.value['3'], 'final', 'finalized');
    }
  }, [betSession, currentBlock]);

  const getPriceForBlock = (blockNumber, type, blockType) => {
    const winKey = contract.methods['getPrice'].cacheCall(blockNumber);
    const windowData =
      drizzleReadinessState.drizzleState.contracts.BinaryBet.getPrice[winKey];
    console.log('GETTING DATA FOR BLOCK', blockNumber);
    if (windowData) {
      console.log(
        'DATA FOR BLOCK',
        blockType,
        blockNumber,
        type,
        'PRICE:',
        windowData.value
      );
    }
  };

  // -----

  React.useEffect(() => {
    if (!firstFetch) return;
    if (!currentWindow || !currentBlock) return;
    const windowNumber = Math.floor(
      (currentBlock.number - FIRST_BLOCK) / WINDOW_DURATION + 1
    );
    const windowEndingBlock = Math.floor(
      FIRST_BLOCK + (windowNumber - 1) * WINDOW_DURATION - 1
    );
    const windowFinalizedBlock = Math.floor(
      FIRST_BLOCK + (windowNumber - 2) * WINDOW_DURATION - 1
    );
    console.log('CALL FOR BLOCKS', windowEndingBlock, windowFinalizedBlock);
    const onGoindDataKey = contract.methods['getPoolValues'].cacheCall(
      windowEndingBlock
    );
    const onGoindData =
      drizzleReadinessState.drizzleState.contracts.BinaryBet.getPoolValues[
        onGoindDataKey
      ];
    const finalizedDataKey = contract.methods['getPoolValues'].cacheCall(
      windowFinalizedBlock
    );
    const finalizedData =
      drizzleReadinessState.drizzleState.contracts.BinaryBet.getPoolValues[
        finalizedDataKey
      ];
    console.log('\n\n\n---DATA', onGoindData, finalizedData);
    if (onGoindData) {
      getValuesFromWei(windowEndingBlock, onGoindData.value);
    }
    if (finalizedData) {
      getValuesFromWei(windowFinalizedBlock, finalizedData.value);
    }
  }, [betSession, currentBlock, firstFetch]);

  // -----
*/

  useEffect(() => {

    // Betting Cards Container Width
    const betDivWidth =
      betScrollDiv.current && betScrollDiv.current.offsetWidth;

    // Betting Card Width
    const pixelsToMove = betDivWidth / 3;

    // Train Aninmation Keyframes
    setTransformAnimation(`
      @keyframes train-animation {
        0% { transform: translate(0px); }
        1% { transform: translate(${pixelsToMove}px); }
        35% { transform: translate(${pixelsToMove}px); }
        100% { transform: translate(0px); }
      }
    `);

    // Train Aninmation
    setTransformMove({ animation: `train-animation 1.5s` });

    // Trim Betting Cards up to MAX_CARDS
    setBets(bets.slice(0,MAX_CARDS));

  }, [betSession]);

  const onBetHandler = ({ value, direction }) => {
    if (Number(value) <= MIN_BET_AMOUNT) {
      alert(`Min bet amount is ${MIN_BET_AMOUNT.toFixed(2)}`);
      return;
    }
    setIsOpenForBetting(false);
    const eth = drizzle.web3.utils.toWei(
      value,
      global.config.currencyRequestValue
    );
    const overBalance = Number(value) > balance ? Number(value) - balance : 0;
    const over = drizzle.web3.utils.toWei(
      `${overBalance}`,
      global.config.currencyRequestValue
    );
    contract.methods['placeBet'].cacheSend(eth, direction, {
      from: ethAccount,
      value: over,
    });
  };

/*
  const getValuesFromWei = (blockNumber, values) => {
    console.log('\n\nUPDATE BLOCK', blockNumber, values);
    const updateBets = bets.slice(0);
    const current = updateBets.find((el) => el.blockSize === blockNumber);
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
    current.poolTotalUp = Number(upValue).toFixed(2);
    current.poolTotalDown = Number(downValue).toFixed(2);
    current.poolSize = (Number(upValue) + Number(downValue)).toFixed(2);
    setBets(updateBets);
  };
*/

  return isLoading ? (
    <div className="h-64 flex flex-col items-center justify-center">
      <Loading />
    </div>
  ) : (
    <>
      <UserArea />

      <BetProgressBar completed={progressValue} />

      <div className="-mx-4 overflow-x-hidden">
        <style children={transformAnimation} />
        <div
          className="transition-all duration-1000 ease-in-out"
          ref={betScrollDiv} style={transformMove}
        >
          <TransitionGroup className="flex flex-row-reverse">
            {bets.map((bet, index) => (
              <CSSTransition
                key={`${bet.id}`}
                timeout={2000}
                classNames="transition"
              >
                <Bet
                  {...bet}
                  betSession={index}
                  onBet={onBetHandler}
                  isOpenForBetting={isOpenForBetting}
                />
              </CSSTransition>
            ))}
          </TransitionGroup>
        </div>
      </div>

      <div className="mt-6">
        <BetChart classAlt="h-64" />
      </div>
    </>
  );
};

export default Dashboard;
