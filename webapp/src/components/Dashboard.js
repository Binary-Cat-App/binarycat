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
import _ from 'lodash';

const MIN_BET_AMOUNT = 0;
const MAX_CARDS = 4;

export const Dashboard = () => {
  const { ethAccount } = useMetaMask();

  const [isLoading] = useState(false);
  const [betSession, setBetSession] = useState(0);
  const {
    drizzle,
    currentBlock,
    balance,
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
    finalizedWindowData,
    finalizedPricesData,
    finalizedPoolData,
    finalizedAccountsData,
    openedWindowChartData,
    ongoingWindowChartData,
    finalizedWindowChartData,
    socketData,
  } = useDrizzle();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const betScrollDiv = useRef(null);
  const [bets, setBets] = useState([]);
  const [transformMove, setTransformMove] = useState(null);
  const [transformAnimation, setTransformAnimation] = useState(null);

  React.useEffect(() => {
    const arr = [...openedWindowChartData, ...socketData];
    const unique = _.uniqBy(arr, 'time');
    console.log('---- OPENED DATA', unique);
    console.log('-----\n\n');
  }, [openedWindowChartData, socketData]);

  React.useEffect(() => {
    console.log('---- ONGOING DATA:', ongoingWindowChartData);
    console.log('-----\n\n');
  }, [ongoingWindowChartData]);

  React.useEffect(() => {
    console.log('---- FINALIZED DATA:', finalizedWindowChartData);
    console.log('-----\n\n');
  }, [finalizedWindowChartData]);

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
            ...openedWindowData,
            ...openedPricesData,
            ...openedPoolData,
            ...openedAccountsData,
            status: 'open',
            id: uuid(),
          },
          {
            ...ongoingWindowData,
            ...ongoingPricesData,
            ...ongoingPoolData,
            ...ongoingAccountsData,
            status: 'ongoing',
            id: uuid(),
          },
          {
            ...finalizedWindowData,
            ...finalizedPricesData,
            ...finalizedPoolData,
            ...finalizedAccountsData,
            status: 'finalized',
            id: uuid(),
          },
          {
            ...finalizedWindowData,
            ...finalizedPricesData,
            ...finalizedPoolData,
            ...finalizedAccountsData,
            status: 'finalized',
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
          opened.endingBlock = ongoingWindowData.endingBlock;
        }

        // Transforms Current Ongoing Card to Finalized Card
        if (ongoing) {
          ongoing.status = 'finalized';
          ongoing.endingBlock = finalizedWindowData.endingBlock;
        }

        // Adds New Open For Betting Card
        updateBets.unshift({
          openedWindowData,
          openedPricesData,
          openedPoolData,
          openedAccountsData,
          status: 'open',
          id: uuid(),
        });

        setBets(updateBets);
      }

      // Reset Cards Train Animation
      setTransformMove({});

      // Betting Cycles Counter
      setBetSession((prev) => prev + 1);
    }
  }, [windowNumber]);

  // Opened for betting window (Card): Update data
  React.useEffect(() => {
    const updateBets = bets.slice(0);
    const selected = updateBets.find((el) => el.status === 'open');
    if (!selected) return;
    selected.endingBlock = openedWindowData.endingBlock;
    selected.betDirectionContract = openedPoolData.betDirection;
    selected.betAmountContract = openedPoolData.betAmount;
    selected.poolTotalUp = openedPoolData.poolTotalUp;
    selected.poolTotalDown = openedPoolData.poolTotalDown;
    selected.poolSize = openedPoolData.poolSize;
    selected.accounts = openedAccountsData.accounts;
  }, [currentBlock, openedWindowData, openedPoolData, openedAccountsData]);

  // Ongoing window (Card): Update data
  React.useEffect(() => {
    const updateBets = bets.slice(0);
    const selected = updateBets.find((el) => el.status === 'ongoing');
    if (!selected) return;
    selected.endingBlock = ongoingWindowData.endingBlock;
    selected.initialPrice = ongoingPricesData.initialPrice;
    selected.betDirectionContract = ongoingPoolData.betDirection;
    selected.betAmountContract = ongoingPoolData.betAmount;
    selected.poolTotalUp = ongoingPoolData.poolTotalUp;
    selected.poolTotalDown = ongoingPoolData.poolTotalDown;
    selected.poolSize = ongoingPoolData.poolSize;
    selected.accounts = ongoingAccountsData.accounts;
  }, [windowNumber, ongoingWindowData, ongoingPoolData, ongoingAccountsData]);

  // Finalized window (Card): Update data
  React.useEffect(() => {
    const updateBets = bets.slice(0);
    const selected = updateBets.find((el) => el.status === 'finalized');
    if (!selected) return;
    selected.endingBlock = finalizedWindowData.endingBlock;
    selected.initialPrice = finalizedPricesData.initialPrice;
    selected.finalPrice = finalizedPricesData.finalPrice;
    selected.betDirectionContract = finalizedPoolData.betDirection;
    selected.betAmountContract = finalizedPoolData.betAmount;
    selected.poolTotalUp = finalizedPoolData.poolTotalUp;
    selected.poolTotalDown = finalizedPoolData.poolTotalDown;
    selected.poolSize = finalizedPoolData.poolSize;
    selected.accounts = finalizedAccountsData.accounts;
  }, [
    windowNumber,
    finalizedWindowData,
    finalizedPoolData,
    finalizedAccountsData,
  ]);

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
  }, [betSession]);

  const onBetHandler = ({ value, direction }) => {
    if (Number(value) <= MIN_BET_AMOUNT) {
      alert(`Min bet amount is ${MIN_BET_AMOUNT.toFixed(2)}`);
      return;
    }

    const eth = drizzle.web3.utils.toWei(
      value,
      global.config.currencyRequestValue
    );

    const overBalance = Number(value) > balance ? Number(value) - balance : 0;

    const over = drizzle.web3.utils.toWei(
      `${overBalance}`,
      global.config.currencyRequestValue
    );

    contract.methods
      .placeBet(eth, direction)
      .send({
        from: ethAccount,
        value: over,
      })
      .on('transactionHash', function (hash) {
        setIsOpenForBetting(false);
        setIsBetPlaced(true);
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
