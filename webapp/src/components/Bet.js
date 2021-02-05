import { ReactComponent as IconUp } from '../assets/images/icon-up.svg';
import { ReactComponent as IconDown } from '../assets/images/icon-down.svg';
import { BetPlaced } from './BetPlaced';
import { PlaceBet } from './PlaceBet';
import { BetChart } from './Chart';
import React, { useEffect, useState } from 'react';

export const Bet = ({
  blockSize,
  initialPrice,
  finalPrice,
  poolTotalUp,
  poolTotalDown,
  poolSize,
  accounts,
  betSession,
}) => {
  const [betStatus, setBetStatus] = useState('open');
  const [betAmount, setBetAmount] = useState(0);
  const [betDirection, setBetDirection] = useState('');

  const [betInitialPrice, setBetIntialPrice] = useState(initialPrice);
  const [betFinalPrice, setbetFinalPrice] = useState(finalPrice);

  useEffect(() => {
    betSession === 1 && setBetStatus('ongoing');
    betSession === 1 && setBetIntialPrice('365.5');

    betSession === 2 && setBetStatus('finalized');
    betSession === 2 && setBetIntialPrice('365.5');
    betSession === 2 && setbetFinalPrice('654,80');

    betSession > 3 && setBetStatus('');
  }, [betSession]);

  function handleBetAmount(event) {
    setBetAmount(event.target.value);
  }

  function handleBetDirection(direction) {
    setBetDirection(direction);
  }

  return (
    <div className="w-1/3 px-4 flex-shrink-0">
      <div className="bg-white p-4 sm:p-6 h-full flex flex-col relative">
        <div className="mb-2">
          <h2 className="text-center text-2xl font-medium">
            {betStatus === 'finalized' && 'Finalized'}
            {betStatus === 'ongoing' && 'Ongoing'}
            {betStatus === 'open' && 'Open for betting'}
          </h2>
          <p className="text-xxs text-gray-300 text-center">
            Block# {blockSize}
          </p>
        </div>

        <div className="-mx-2 flex-grow ">
          {betStatus === 'open' ? (
            <PlaceBet
              betAmount={betAmount}
              handleBetAmount={handleBetAmount}
              handleBetDirection={handleBetDirection}
            />
          ) : (
            <BetChart classAlt="h-48" />
          )}
        </div>

        <div className="bg-white px-2 py-4 -mx-2  shadow-lg my-4">
          <div className="flex -mx-2">
            <div className="px-2 w-1/2">
              <div className="flex flex-col items-center border-r">
                <span
                  className={`px-2 rounded-full text-white text-xxs ${
                    betInitialPrice ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                >
                  Initial Price
                </span>
                <span
                  className={`font-digits text-xl xl:text-2xl ${
                    !betInitialPrice && 'text-gray-300'
                  }`}
                >
                  {betInitialPrice ? betInitialPrice : '?'}
                </span>
              </div>
            </div>
            <div className="px-2 w-1/2">
              <div className="flex flex-col items-center">
                <span
                  className={`px-2 rounded-full text-white text-xxs ${
                    betFinalPrice ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                >
                  Final Price
                </span>
                <span
                  className={`font-digits text-xl xl:text-2xl ${
                    !betFinalPrice && 'text-gray-300'
                  }`}
                >
                  {betFinalPrice ? betFinalPrice : '?'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex -mx-2 items-center">
          <div className="px-2 flex-grow">
            <div className="flex items-center">
              <span className="flex-shrink-0 mr-2">
                <IconUp className="icon text-green-500" />
              </span>
              <span className="font-digits text-xl xl:text-2xl text-green-500">
                {poolTotalUp}
              </span>
              <span className="text-xxs text-gray-300 ml-2">ETH</span>
            </div>
            <div className="flex items-center">
              <span className="flex-shrink-0 mr-2">
                <IconDown className="icon text-pink-500" />
              </span>
              <span className="font-digits text-xl xl:text-2xl text-pink-500">
                {poolTotalDown}
              </span>
              <span className="text-xxs text-gray-300 ml-2">ETH</span>
            </div>
          </div>
          <div className="px-2 flex-shrink-0">
            <BetPlaced
              betAmount={betAmount}
              betDirection={betDirection}
              isWon={
                (betStatus === 'finalized' &&
                  betDirection === 'up' &&
                  betFinalPrice > betInitialPrice) ||
                (betStatus === 'finalized' &&
                  betDirection === 'down' &&
                  betFinalPrice < betInitialPrice)
              }
              isLost={
                (betStatus === 'finalized' &&
                  betDirection === 'up' &&
                  betFinalPrice < betInitialPrice) ||
                (betStatus === 'finalized' &&
                  betDirection === 'down' &&
                  betFinalPrice > betInitialPrice)
              }
            />
          </div>
        </div>

        <hr className="my-4" />

        <div className="flex items-center">
          <span className="text-xxs text-gray-300 w-1/4">Pool Size</span>
          <div className="w-3/4 flex items-center">
            <span className="font-digits text-xl xl:text-2xl">{poolSize}</span>
            <span className="text-xxs text-gray-300 ml-2">ETH</span>
          </div>
        </div>

        <div className="flex items-center">
          <span className="text-xxs text-gray-300 w-1/4">Accounts</span>
          <div className="w-3/4 flex items-center">
            <span className="font-digits text-xl xl:text-2xl">{accounts}</span>
          </div>
        </div>
      </div>
    </div>
  );
};