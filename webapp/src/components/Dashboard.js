import React, { useEffect, useState, useRef } from 'react';

import { Bet } from './Bet';
import { Loading } from './Loading';
import { UserSummary } from './UserSummary';
import { UserActions } from './UserActions';
import { DismissableAlert } from './DismissableAlert';
import { BetChart } from './BigChart';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { v4 as uuid } from 'uuid';
import { BetProgressBar } from './BetProgressBar';
import {
  CURRENCY_AVAX,
  CURRENCY_KITTY,
  useBetting,
} from '../context/BettingContext';
import _ from 'lodash';
import soundEffect from '../assets/sounds/bell-ring.ogg';
import { ControlBar } from './ControlBar';
import { getWeb3ReactContext } from '@web3-react/core';

const MIN_BET_AMOUNT = 0;
const MAX_CARDS = 4;

export const Dashboard = () => {
  const [isLoading] = useState(false);
  const [betSession, setBetSession] = useState(0);
  const {
    currentTimestamp,
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
    contract,
    selectedCurrency,
    selectCurrency,
    selectedWindowTime,
    selectWindowTime,
    userAllowance,
    contractPermissionRequested,
  } = useBetting();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const betScrollDiv = useRef(null);
  const [bets, setBets] = useState([
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
  const [transformMove, setTransformMove] = useState(null);
  const [transformAnimation, setTransformAnimation] = useState(null);

  // Betting Cards Initialization
  React.useEffect(() => {
    if (currentTimestamp) {
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
          opened.endingTimestamp = ongoingWindowData.endingTimestamp;
        }

        // Transforms Current Ongoing Card to Finalized Card
        if (ongoing) {
          ongoing.status = 'finalized';
          ongoing.endingTimestamp = finalizedWindowData.endingTimestamp;
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
    selected.endingTimestamp = openedWindowData.endingTimestamp;
    selected.betDirectionContract = openedPoolData.betDirection;
    selected.betAmountContract = openedPoolData.betAmount;
    selected.poolTotalUp = openedPoolData.poolTotalUp;
    selected.poolTotalDown = openedPoolData.poolTotalDown;
    selected.poolSize = openedPoolData.poolSize;
    selected.accounts = openedAccountsData.accounts;
    selected.betAmountUp = openedPoolData.betAmountUp;
    selected.betAmountDown = openedPoolData.betAmountDown;
    selected.userBets = openedPoolData.userBets;
  }, [currentTimestamp, openedWindowData, openedPoolData, openedAccountsData]);

  // Ongoing window (Card): Update data
  React.useEffect(() => {
    const updateBets = bets.slice(0);
    const selected = updateBets.find((el) => el.status === 'ongoing');
    if (!selected) return;
    selected.endingTimestamp = ongoingWindowData.endingTimestamp;
    selected.initialPrice = ongoingPricesData.initialPrice;
    selected.betDirectionContract = ongoingPoolData.betDirection;
    selected.betAmountContract = ongoingPoolData.betAmount;
    selected.poolTotalUp = ongoingPoolData.poolTotalUp;
    selected.poolTotalDown = ongoingPoolData.poolTotalDown;
    selected.poolSize = ongoingPoolData.poolSize;
    selected.accounts = ongoingAccountsData.accounts;
    selected.betAmountUp = ongoingPoolData.betAmountUp;
    selected.betAmountDown = ongoingPoolData.betAmountDown;
    selected.userBets = ongoingPoolData.userBets;
  }, [
    windowNumber,
    ongoingWindowData,
    ongoingPoolData,
    ongoingAccountsData,
    ongoingPricesData,
  ]);

  // Finalized window (Card): Update data
  React.useEffect(() => {
    const updateBets = bets.slice(0);
    const selected = updateBets.find((el) => el.status === 'finalized');
    if (!selected) return;
    selected.endingTimestamp = finalizedWindowData.endingTimestamp;
    selected.initialPrice = finalizedPricesData.initialPrice;
    selected.finalPrice = finalizedPricesData.finalPrice;
    selected.betDirectionContract = finalizedPoolData.betDirection;
    selected.betAmountContract = finalizedPoolData.betAmount;
    selected.poolTotalUp = finalizedPoolData.poolTotalUp;
    selected.poolTotalDown = finalizedPoolData.poolTotalDown;
    selected.poolSize = finalizedPoolData.poolSize;
    selected.accounts = finalizedAccountsData.accounts;
    selected.betAmountUp = finalizedPoolData.betAmountUp;
    selected.betAmountDown = finalizedPoolData.betAmountDown;
    selected.userBets = finalizedPoolData.userBets;
  }, [
    windowNumber,
    finalizedWindowData,
    finalizedPoolData,
    finalizedAccountsData,
    finalizedPricesData,
  ]);

  const audioRef = useRef(null);

  const play = () => {
    const promise = audioRef.current.play();
    if (promise) {
      promise
        .then((_) => {
          // Autoplay started!
        })
        .catch((error) => {
          // Autoplay was prevented.
          // Show a "Play" button so that user can start playback.
        });
    }
  };

  useEffect(() => {
    play();
  }, [windowNumber]);

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

  const onBetHandler = ({ value, direction, callback }) => {
    if (account) {
      if (Number(value) <= MIN_BET_AMOUNT) {
        alert(`Min bet amount is ${MIN_BET_AMOUNT.toFixed(2)}`);
        return;
      }

      const _bet = currencyToWei(value, true);
      // Check currency
      if (selectedCurrency === CURRENCY_AVAX && selectedWindowTime === 5) {
        contract.methods
          .placeBet(direction)
          .send({
            from: account,
            value: _bet.toString(),
          })
          .on('transactionHash', function (hash) {
            setIsOpenForBetting(true);
            setIsBetPlaced(true);
            callback();
          });
      } else {
        contract.methods
          .placeBet(direction, _bet.toString())
          .send({
            from: account,
          })
          .on('transactionHash', function (hash) {
            setIsOpenForBetting(true);
            setIsBetPlaced(true);
            callback();
          });
      }
    }
  };

  return isLoading ? (
    <div className="h-64 flex flex-col items-center justify-center">
      <Loading />
    </div>
  ) : (
    <>
      <ControlBar
        selectedCurrency={selectedCurrency}
        selectCurrency={selectCurrency}
        selectedWindowTime={selectedWindowTime / 1} // Forces cast to int
        selectWindowTime={selectWindowTime}
      ></ControlBar>

      <div className="flex mb-6 -mx-4 my-auto items-center flex-col md:flex-row">
        <UserSummary selectedCurrency={selectedCurrency} />
        <UserActions />
      </div>

      <audio src={soundEffect} ref={audioRef} autoPlay></audio>

      <DismissableAlert name="alert-unclaimed-gains">
        <span className="text-sm text-gray-300">
          Unclaimed gains and KITTY tokens are transferred to your MetaMask
          wallet by using the claim button or automatically on your next bet.
        </span>
      </DismissableAlert>

      {/* <ControlBar></ControlBar> */}

      <BetProgressBar completed={progress} />

      <div className="-mx-4 mb-6 overflow-x-hidden">
        <style children={transformAnimation} />
        <div
          className="transition-all duration-1000 ease-in-out"
          ref={betScrollDiv}
          style={transformMove}
        >
          <TransitionGroup className="flex flex-col lg:flex-row-reverse">
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
                    selectedCurrency={selectedCurrency}
                    selectedWindowTime={selectedWindowTime}
                    userAllowance={userAllowance}
                    permissionRequested={contractPermissionRequested}
                  />
                </CSSTransition>
              );
            })}
          </TransitionGroup>
        </div>
      </div>

      <DismissableAlert name="alert-prices">
        <span className="text-sm text-gray-300">
          There may be a discrepancy between initial/final prices and prices
          shown on the graph. The graph is just for illustration purpose, the
          official prices, used to settle the bets, are the initial/final prices
          collected from the Chainlink onchain API
        </span>
      </DismissableAlert>

      <div className="bg-white rounded-3xl mt-2 px-4">
        <BetChart classAlt="h-64" chart={historicalChartData} />
      </div>
    </>
  );
};

export default Dashboard;
