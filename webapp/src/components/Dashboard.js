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
        console.log('WINDOW DATA:::', windowData.value);
        setCurrentWindowValue(windowData.value);
      }
    }
  }, [currentBlock]);

  useEffect(() => {
    if (!currentBlock) return;
    const betsArr = bets.slice(0);
    const current = betsArr.find((el) => el.status === 'open');
    const finalized = betsArr.find((el) => el.status === 'finalized');
    const windowNumber = Math.floor(
      (currentBlock.number - FIRST_BLOCK) / WINDOW_DURATION + 1
    );
    const windowFinalizedBlock = Math.floor(
      FIRST_BLOCK + (windowNumber - 2) * WINDOW_DURATION - 1
    );
    if (finalized) {
      finalized.blockSize = windowFinalizedBlock;
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
        FIRST_BLOCK + (windowNumber - 1) * WINDOW_DURATION - 1
      );
      const windowFinalizedBlock = Math.floor(
        FIRST_BLOCK + (windowNumber - 2) * WINDOW_DURATION - 1
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
            blockSize: windowFinalizedBlock,
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
        ongoing.blockSize = windowFinalizedBlock;
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
        const upValue =
          Math.round(
            drizzle.web3.utils.fromWei(currentWindowValue['2'], 'ether') * 100
          ) / 100;
        const downValue =
          Math.round(
            drizzle.web3.utils.fromWei(currentWindowValue['1'], 'ether') * 100
          ) / 100;
        current.poolTotalUp = Number(upValue).toFixed(2);
        current.poolTotalDown = Number(downValue).toFixed(2);
        current.poolSize = (Number(upValue) + Number(downValue)).toFixed(2);
        console.log(
          'Up value Wei:',
          currentWindowValue['2'],
          ' ETH: ',
          drizzle.web3.utils.fromWei(currentWindowValue['2'], 'ether')
        );
        console.log(
          'Down value Wei:',
          currentWindowValue['1'],
          'ETH: ',
          drizzle.web3.utils.fromWei(currentWindowValue['1'], 'ether')
        );
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
