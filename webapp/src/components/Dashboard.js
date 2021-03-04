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
  poolTotalUp: '0.00',
  poolTotalDown: '0.00',
  poolSize: '0.00',
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
    openedWindowData,
    openedPoolData,
    openedAccountsData, 
    ongoingWindowData,
    ongoingPoolData,
    ongoingAccountsData,
    finalizedWindowData,
    finalizedPoolData,
    finalizedAccountsData,
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

  // Betting Cards Initialisation
  React.useEffect(() => {
    if (currentBlock) {

      if (isFirstLoad) {
        // Initialize Cards
        setBets((prev) => [
          {
            ...defaultData,
            status: 'open',
            blockSize: openedWindowData.endingBlock,
            id: uuid(),
          },
          {
            ...defaultData,
            initialPrice: '0.00',
            finalPrice: '',
            status: 'ongoing',
            blockSize: ongoingWindowData.endingBlock,
            id: uuid(),
          },
          {
            ...defaultData,
            finalPrice: '0.00',
            initialPrice: '0.00',
            status: 'finalized',
            blockSize: finalizedWindowData.endingBlock,
            id: uuid(),
          },
          {
            ...defaultData,
            finalPrice: '0.00',
            initialPrice: '0.00',
            status: 'finalized',
            blockSize: finalizedWindowData.endingBlock,
            id: uuid(),
          },
        ]);

        setIsFirstLoad(false);
      } else {
        const updateBets = bets.slice(0);
        const opened = updateBets.find((el) => el.status === 'open');
        const ongoing = updateBets.find((el) => el.status === 'ongoing');

        // Transforms Current Open For Betting Card to Ongoing Card
        if (opened) {
          opened.status = 'ongoing';
          opened.blockSize = ongoingWindowData.endingBlock;
          opened.initialPrice = '0.00';
          opened.finalPrice = '?';
        }

        // Transforms Current Ongoing Card to Finalized Card
        if (ongoing) {
          ongoing.status = 'finalized';
          ongoing.blockSize = finalizedWindowData.endingBlock;
          ongoing.finalPrice = '0.00';
          ongoing.finalPrice = '0.00';
        }

        // Adds New Open For Betting Card
        updateBets.unshift({
          ...defaultData,
          status: 'open',
          blockSize: openedWindowData.endingBlock,
          id: uuid(),
        });
        setBets(updateBets);
      }

      // Reset Cards Train Animation
      setTransformMove({});

      // Betting Cycles Counter
      setBetSession((prev) => prev + 1);
      
      setIsOpenForBetting(true);
    }
  }, [windowNumber]);

  // Opened for betting window (Card): Update data
  React.useEffect(() => {
    const updateBets = bets.slice(0);
    const selected = updateBets.find(
      (el) => el.status === 'open'
    );
    if (!selected) return;
    selected.blockSize = openedWindowData.endingBlock;
    selected.poolTotalUp = openedPoolData.poolTotalUp;
    selected.poolTotalDown = openedPoolData.poolTotalDown;
    selected.poolSize = openedPoolData.poolSize;
    selected.accounts = openedAccountsData;
  }, [currentBlock, openedWindowData, openedPoolData, openedAccountsData]);

  // Ongoing window (Card): Update data
  React.useEffect(() => {
    const updateBets = bets.slice(0);
    const selected = updateBets.find(
      (el) => el.status === 'ongoing'
    );
    if (!selected) return;
    selected.blockSize = ongoingWindowData.endingBlock;
    selected.initialPrice = ongoingPoolData.initialPrice;
    selected.poolTotalUp = ongoingPoolData.poolTotalUp;
    selected.poolTotalDown = ongoingPoolData.poolTotalDown;
    selected.poolSize = ongoingPoolData.poolSize;
    selected.accounts = ongoingAccountsData;
  }, [openedWindowData, ongoingPoolData, ongoingAccountsData, windowNumber]);

  // Finalized window (Card): Update data
  React.useEffect(() => {
    const updateBets = bets.slice(0);
    const selected = updateBets.find(
      (el) => el.status === 'finalized'
    );
    if (!selected) return;
    selected.blockSize = finalizedWindowData.endingBlock;
    selected.initialPrice = finalizedPoolData.initialPrice;
    selected.finalPrice = finalizedPoolData.finalPrice;
    selected.poolTotalUp = finalizedPoolData.poolTotalUp;
    selected.poolTotalDown = finalizedPoolData.poolTotalDown;
    selected.poolSize = finalizedPoolData.poolSize;
    selected.accounts = finalizedAccountsData;
  }, [finalizedWindowData, finalizedPoolData, finalizedAccountsData, windowNumber]);

  // Train animation on every new betting window
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

    // Train Aninmation execution
    setTransformMove({ animation: `train-animation 1.5s` });

    // Trim Betting Cards up to MAX_CARDS
    setBets(bets.slice(0, MAX_CARDS));

    //console.log("Bets: ", bets);
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
