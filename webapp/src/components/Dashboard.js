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
  poolTotalUp: '22.46',
  poolTotalDown: '11.01',
  poolSize: '33.47',
  accounts: '100',
  price: '370',
};

const betSessionPeriod = 10;
const FIRST_BLOCK = 1;
const WINDOW_DURATION = 10;

export const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [betSession, setBetSession] = useState(0);
  const [counter, setCounter] = useState(betSessionPeriod);
  const { drizzle, drizzleReadinessState, currentBlock } = useDrizzle();
  const [startBlock, setStartBlock] = useState(0);
  const [progressValue, setProgressValue] = useState(100);
  const [currentWindow, setCurrentWindow] = useState(null);
  const [currentWindowValue, setCurrentWindowValue] = useState(null);

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

  React.useEffect(() => {
    console.log(currentWindowValue);
    if (currentWindowValue) {
      const updateBets = bets.slice(0);
      const current = updateBets.find((el) => el.status === 'open');
      current.poolTotalUp = currentWindowValue['2'];
      current.poolTotalDown = currentWindowValue['1'];
      setBets(updateBets);
    }
  }, [currentWindowValue]);

  const betScrollDiv = useRef(null);

  const [bets, setBets] = useState([
    {
      ...exampleData,
      finalPrice: '384.02',
      initialPrice: '370',
      status: 'finalized',
      id: uuid(),
    },
    {
      ...exampleData,
      initialPrice: '370',
      finalPrice: '',
      status: 'ongoing',
      id: uuid(),
    },

    {
      ...exampleData,
      status: 'open',
      id: uuid(),
    },
  ]);

  useEffect(() => {
    const betDivWidth =
      betScrollDiv.current && betScrollDiv.current.offsetWidth;
    const pixelsToMove = betSession * (betDivWidth / 3);

    betScrollDiv.current.style.transform = `translateX(${-pixelsToMove}px)`;
  }, [betSession]);

  React.useEffect(() => {
    console.log('WINDOW::', currentWindow);
    if (!currentWindow) return;

    setBets((prev) => [
      {
        ...exampleData,
        status: 'open',
        blockSize: currentBlock.number,
        id: uuid(),
        betSessionPeriod: betSessionPeriod,
      },
      ...prev,
    ]);
    setBetSession((prev) => prev + 1);
    setCounter(betSessionPeriod);
  }, [currentWindow]);

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
