import React, { useEffect, useState, useRef } from 'react';
import { Bet } from './Bet';
import { Loading } from './Loading';
import { UserArea } from './UserArea';
import { BetChart } from './Chart';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { v4 as uuid } from 'uuid';
import { BetProgressBar } from './BetProgressBar';
import { useDrizzle } from '../context/DrizzleContext';

const exampleData = {
  blockSize: '11,029,235',
  poolTotalUp: '0.00',
  poolTotalDown: '0.00',
  poolSize: '33.47',
  accounts: '100',
  price: '370',
};

const betSessionPeriod = 10;
const FIRST_BLOCK = 1;
const WINDOW_DURATION = 10;

export const Dashboard = () => {
  const [isLoading] = useState(false);
  const [betSession, setBetSession] = useState(0);
  const [counter, setCounter] = useState(betSessionPeriod);
  const { drizzle, drizzleReadinessState, currentBlock } = useDrizzle();
  const [startBlock, setStartBlock] = useState(0);
  const [progressValue, setProgressValue] = useState(100);
  const [currentWindow, setCurrentWindow] = useState(null);
  const [currentWindowValue, setCurrentWindowValue] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const betScrollDiv = useRef(null);
  const [bets, setBets] = useState([]);

  const contract = React.useMemo(() => {
    return drizzle.contracts.BinaryBet;
  }, [drizzle.contracts]);

  useEffect(() => {
    if (currentBlock) {
      const windowNumber = Math.floor(
        (currentBlock.number - FIRST_BLOCK) / WINDOW_DURATION + 1
      );
      setCurrentWindow(windowNumber);
      const start = FIRST_BLOCK + (windowNumber - 1) * WINDOW_DURATION;
      console.log('---');
      console.log('BettingWindow', windowNumber);
      console.log('WindowFirstBlock', start);
      console.log('CurrentBlock', currentBlock.number);
      const progress =
        100 - ((currentBlock.number - start) / WINDOW_DURATION) * 100;
      setProgressValue(progress);

      const winKey = contract.methods['getPoolValues'].cacheCall(windowNumber);
      const windowData =
        drizzleReadinessState.drizzleState.contracts.BinaryBet.getPoolValues[
          winKey
        ];
      if (windowData) {
        setCurrentWindowValue(windowData.value);
      }
    }
  }, [currentBlock]);

  useEffect(() => {
    const betsArr = bets.slice(0);
    const current = betsArr.find((el) => el.status === 'open');
    const finalized = betsArr.find((el) => el.status === 'finalized');
    if (finalized) {
      finalized.blockSize = currentBlock.number - 2;
    }
    if (current) {
      current.blockSize = currentBlock.number;
    }
    setBets(betsArr);
  }, [currentBlock]);

  React.useEffect(() => {
    if (currentBlock) {
      const windowNumber = Math.floor(
        (currentBlock.number - FIRST_BLOCK) / WINDOW_DURATION + 1
      );
      const windowEndingBlock = Math.floor(
        FIRST_BLOCK + windowNumber * WINDOW_DURATION - 1
      );
      const windowFinalizedBlock = Math.floor(
        (currentBlock.number - FIRST_BLOCK) / WINDOW_DURATION + 1
      );
      if (isFirstLoad) {
        setBets((prev) => [
          {
            ...exampleData,
            status: 'open',
            blockSize: currentBlock.number,
            id: uuid(),
          },
          {
            ...exampleData,
            initialPrice: '0.00',
            finalPrice: '',
            status: 'ongoing',
            blockSize: windowEndingBlock,
            id: uuid(),
          },
          {
            ...exampleData,
            finalPrice: '0.00',
            initialPrice: '0.00',
            status: 'finalized',
            blockSize: currentBlock.number - 2,
            id: uuid(),
          },
          {
            ...exampleData,
            finalPrice: '0.00',
            initialPrice: '0.00',
            status: 'finalized',
            blockSize: windowFinalizedBlock,
            id: uuid(),
          },
        ]);
        setBetSession((prev) => prev + 1);
        setCounter(betSessionPeriod);
        setIsFirstLoad(false);
      } else {
        const prevBets = bets.slice(0);
        const opened = prevBets.find((el) => el.status === 'open');
        const ongoing = prevBets.find((el) => el.status === 'ongoing');
        opened.status = 'ongoing';
        opened.blockSize = windowEndingBlock;
        opened.initialPrice = '0.00';
        opened.finalPrice = '?';
        ongoing.status = 'finalized';
        ongoing.blockSize = currentBlock.number - 2;
        ongoing.finalPrice = '0.00';
        ongoing.finalPrice = '0.00';

        prevBets.unshift({
          ...exampleData,
          status: 'open',
          blockSize: currentBlock.number,
          id: uuid(),
        });

        setBets(prevBets);
        setBetSession((prev) => prev + 1);
        setCounter(betSessionPeriod);
      }
    }
  }, [currentWindow]);

  React.useEffect(() => {
    if (currentWindowValue) {
      const updateBets = bets.slice(0);
      const current = updateBets.find((el) => el.status === 'open');
      if (current) {
        current.poolTotalUp = Number(currentWindowValue['2']).toFixed(2);
        current.poolTotalDown = Number(currentWindowValue['1']).toFixed(2);
        setBets(updateBets);
      }
    }
  }, [currentWindowValue]);

  useEffect(() => {
    const betDivWidth =
      betScrollDiv.current && betScrollDiv.current.offsetWidth;
    const pixelsToMove = betSession * (betDivWidth / 3);

    betScrollDiv.current.style.transform = `translateX(${-pixelsToMove}px)`;
  }, [betSession]);

  return isLoading ? (
    <div className="h-64 flex flex-col items-center justify-center">
      <Loading />
    </div>
  ) : (
    <>
      <UserArea />

      <BetProgressBar completed={progressValue} />

      <div className="-mx-4 overflow-x-hidden">
        <div
          className="transition-all duration-1000 ease-in-out"
          ref={betScrollDiv}
        >
          <TransitionGroup className="flex justify-end flex-row-reverse">
            {bets.map((bet, index) => (
              <CSSTransition
                key={`${bet.id}`}
                timeout={2000}
                classNames="transition"
              >
                <Bet {...bet} betSession={index} />
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
