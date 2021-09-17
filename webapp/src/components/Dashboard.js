import React, { useEffect, useState, useRef } from 'react';

import { Bet } from './Bet';
import { Loading } from './Loading';
import { UserSummary } from './UserSummary';
import { UserActions } from './UserActions';
import { BetChart } from './BigChart';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { v4 as uuid } from 'uuid';
import { BetProgressBar } from './BetProgressBar';
import { useBetting } from '../context/BettingContext';
import _ from 'lodash';

const MIN_BET_AMOUNT = 0;
const MAX_CARDS = 4;

export const Dashboard = () => {
  const [isLoading] = useState(false);
  const [betSession, setBetSession] = useState(0);
  const {
    currentBlock,
    account,
    unsettledGains,
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
    weiToCurrency,
    currencyToWei,
    web3Eth,
    web3Utils,
    contractObj
  } = useBetting();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const betScrollDiv = useRef(null);
  const [bets, setBets] = useState(
    [
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
    ]
  );
  const [transformMove, setTransformMove] = useState(null);
  const [transformAnimation, setTransformAnimation] = useState(null);

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
  }, [
    currentBlock, 
    openedWindowData, 
    openedPoolData, 
    openedAccountsData
  ]);

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
  }, [
    windowNumber, 
    ongoingWindowData, 
    ongoingPoolData, 
    ongoingAccountsData,
    ongoingPricesData
  ]);

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
    finalizedPricesData
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
    if ( account ) {
      
      if (Number(value) <= MIN_BET_AMOUNT) {
        alert(`Min bet amount is ${MIN_BET_AMOUNT.toFixed(2)}`);
        return;
      }

      const _bet = currencyToWei(value, true);

      contractObj.methods
        .placeBet(direction)
        .send({
          from: account,
          value: _bet.toString(),
        })
        .on('transactionHash', function (hash) {
          setIsOpenForBetting(false);
          setIsBetPlaced(true);
        });
    }
  };

  return isLoading ? (
    <div className="h-64 flex flex-col items-center justify-center">
      <Loading />
    </div>
  ) : (
    <>
      <div className="flex -mx-4 my-auto items-center">
        <UserSummary />
        <UserActions />
      </div>

      <div className={`flex flex-row p-5 text-xs text-gray-300`}>
        <span className={`mr-2`}>*</span><span>The values are transfered to your account by using the claim button or automatically on your next bet.</span>
      </div>

      <BetProgressBar completed={progress} />

      <div className="-mx-4 overflow-x-hidden">
        <style children={transformAnimation} />
        <div
          className="transition-all duration-1000 ease-in-out"
          ref={betScrollDiv}
          style={transformMove}
        >
          <TransitionGroup className="flex flex-row-reverse">
            {bets.map((bet, index) => {
              let data = [];
              if (bet.status === 'finalized') {
                data = _.uniqBy(finalizedWindowChartData, 'time');
              }
              if (bet.status === 'ongoing') {
                data = _.uniqBy(ongoingWindowChartData, 'time');
              }
              return (
                <CSSTransition
                  key={`${bet.id}`}
                  timeout={2000}
                  classNames="transition"
                >
                  <Bet
                    {...bet}
                    chart={data}
                    betSession={index}
                    onBet={onBetHandler}
                    isOpenForBetting={isOpenForBetting}
                  />
                </CSSTransition>
              );
            })}
          </TransitionGroup>
        </div>
      </div>

      <div className={`flex flex-row p-5 text-xs text-gray-300`}>
        <span className={`mr-2`}>*</span><span>There may be a discrepancy between initial/final prices and prices shown on the graph. The graph is just for illustration purpose, the official prices, used to settle the bets, are the initial/final prices collected from the Chainlink onchain API</span>
      </div>

      <div className="bg-white rounded-3xl mt-2 px-4">
        <BetChart classAlt="h-64" chart={historicalChartData} />
      </div>
    </>
  );
};

export default Dashboard;
