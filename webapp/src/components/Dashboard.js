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

export const Dashboard = () => {
  const { ethAccount } = useMetaMask();

  const [isLoading] = useState(false);
  const [betSession, setBetSession] = useState(0);
  const {
    drizzle,
    currentBlock,
    balance,
    progress,
    windowNumber,
    windowEndingNumber,
    windowFinalizedNumber,
    currentData,
    endingData,
    finalizedData,
  } = useDrizzle();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const betScrollDiv = useRef(null);
  const [bets, setBets] = useState([]);
  const [isOpenForBetting, setIsOpenForBetting] = useState(true);
  const [transformMove, setTransformMove] = useState(null);
  const [transformAnimation, setTransformAnimation] = useState(null);

  const contract = React.useMemo(() => {
    return drizzle.contracts.BinaryBet;
  }, [drizzle.contracts]);

  // Change opened for betting window number on every new block
  React.useEffect(() => {
    const prevBets = bets.slice(0);
    const opened = prevBets.find((el) => el.status === 'open');
    if (!opened) return;
    opened.blockSize = currentBlock.number;
    setBets(prevBets);
  }, [currentBlock]);

  React.useEffect(() => {
    if (currentBlock) {
      // Reset Cards Train Animation

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
            initialPrice: '10.00',
            finalPrice: '',
            status: 'ongoing',
            blockSize: windowEndingNumber,
            id: uuid(),
          },
          {
            ...defaultData,
            finalPrice: '10.00',
            initialPrice: '10.00',
            status: 'finalized',
            blockSize: windowFinalizedNumber,
            id: uuid(),
          },
          {
            ...defaultData,
            finalPrice: '10.00',
            initialPrice: '10.00',
            status: 'finalized',
            blockSize: windowFinalizedNumber,
            id: uuid(),
          },
        ]);

        setIsFirstLoad(false);
      } else {
        const prevBets = bets.slice(0);
        const opened = prevBets.find((el) => el.status === 'open');
        const ongoing = prevBets.find((el) => el.status === 'ongoing');
        console.log('OPENED', opened);
        console.log('ONGOIND', ongoing);

        // Transforms Current Open For Betting to Ongoing
        if (opened) {
          opened.status = 'ongoing';
          opened.blockSize = windowEndingNumber;
          opened.initialPrice = '0.00';
          opened.finalPrice = '?';
        }

        // Transforms Current Ongoing to Finalized
        if (ongoing) {
          ongoing.status = 'finalized';
          ongoing.blockSize = windowFinalizedNumber;
          ongoing.finalPrice = '0.00';
          ongoing.finalPrice = '0.00';
        }

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
      setTransformMove({});
      setBetSession((prev) => prev + 1);
      // setCounter(betSessionPeriod);
      setIsOpenForBetting(true);
    }
  }, [windowNumber]);

  // Update data from contract for opened for betting window
  React.useEffect(() => {
    const updateBets = bets.slice(0);
    const current = updateBets.find((el) => el.status === 'open');
    if (!current) return;
    current.poolTotalUp = currentData.poolTotalUp;
    current.poolTotalDown = currentData.poolTotalDown;
    current.poolSize = currentData.poolSize;
  }, [currentData, windowNumber]);

  // Update data from contract for ongoing window
  React.useEffect(() => {
    const updateBets = bets.slice(0);
    const current = updateBets.find(
      (el) => el.blockSize === windowEndingNumber
    );
    if (!current) return;
    current.poolTotalUp = endingData.poolTotalUp;
    current.poolTotalDown = endingData.poolTotalDown;
    current.poolSize = endingData.poolSize;
    current.initialPrice = endingData.initialPrice;
  }, [endingData, windowEndingNumber]);

  // Update data from contract for finalized window
  React.useEffect(() => {
    const updateBets = bets.slice(0);
    const current = updateBets.find(
      (el) => el.blockSize === windowFinalizedNumber
    );
    if (!current) return;
    current.poolTotalUp = finalizedData.poolTotalUp;
    current.poolTotalDown = finalizedData.poolTotalDown;
    current.poolSize = finalizedData.poolSize;
    current.initialPrice = finalizedData.initialPrice;
    current.finalPrice = finalizedData.finalPrice;
  }, [finalizedData, windowFinalizedNumber]);

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
    setBets(bets.slice(0, MAX_CARDS));
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

  return isLoading ? (
    <div className="h-64 flex flex-col items-center justify-center">
      <Loading />
    </div>
  ) : (
    <>
      <UserArea />

      <BetProgressBar completed={progress} />

      <div className="-mx-4 overflow-x-hidden">
        <style children={transformAnimation} />
        <div
          className="transition-all duration-1000 ease-in-out"
          ref={betScrollDiv}
          style={transformMove}
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
