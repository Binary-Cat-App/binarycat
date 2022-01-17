import { ReactComponent as IconUp } from '../assets/images/icon-up.svg';
import { ReactComponent as IconDown } from '../assets/images/icon-down.svg';
import { ReactComponent as IconSpinner } from '../assets/images/icon-spinner.svg';
import { BetPlaced } from './BetPlaced';
import { PlaceBet } from './PlaceBet';
import { BetChart } from './Chart';
import React, { useState } from 'react';

export const Bet = ({
  endingTimestamp,
  initialPrice,
  finalPrice,
  betDirectionContract,
  betAmountContract,
  poolTotalUp,
  poolTotalDown,
  poolSize,
  accounts,
  betSession,
  status,
  id,
  onBet,
  isOpenForBetting,
  chart,
}) => {
  const [betAmount, setBetAmount] = useState(0);
  const [betDirection, setBetDirection] = useState('');

  const _isWon =
    (status === 'finalized' &&
      betDirectionContract === 'up' &&
      finalPrice > 0 &&
      initialPrice > 0 &&
      finalPrice > initialPrice) ||
    (status === 'finalized' &&
      betDirectionContract === 'down' &&
      finalPrice > 0 &&
      initialPrice > 0 &&
      finalPrice < initialPrice);
  const _isLost =
    (status === 'finalized' &&
      betDirectionContract === 'up' &&
      finalPrice > 0 &&
      initialPrice > 0 &&
      finalPrice < initialPrice) ||
    (status === 'finalized' &&
      betDirectionContract === 'down' &&
      finalPrice > 0 &&
      initialPrice > 0 &&
      finalPrice > initialPrice);

  const _isUp =
    status === 'finalized' &&
    finalPrice > 0 &&
    initialPrice > 0 &&
    finalPrice > initialPrice;
  const _isDown =
    status === 'finalized' &&
    finalPrice > 0 &&
    initialPrice > 0 &&
    finalPrice < initialPrice;

  const _initialPrice = initialPrice ? parseFloat(initialPrice) : 0;
  const _finalPrice = finalPrice ? parseFloat(finalPrice) : 0;

  React.useEffect(() => {
    setBetDirection(betDirectionContract);
    setBetAmount(betAmountContract);
  }, [betDirectionContract, betAmountContract]);

  function handleBetAmount(value) {
    setBetAmount(value);
  }

  function handleBetDirection(direction) {
    setBetDirection(direction);
    if (status === 'open' && isOpenForBetting) {
      onBet &&
        onBet({
          value: betAmount,
          direction: direction === 'up' ? 1 : 0,
        });
    }
  }

  return (
    <div className="w-full lg:w-1/3 px-4 pb-4 lg:pb-0 flex-shrink-0">
      <div
        className={`${
          _isWon
            ? 'border-2 border-yellow-300'
            : _isLost
            ? 'border-2 border-gray-100'
            : ''
        } bg-white p-4 sm:p-6 h-full flex flex-col relative rounded-3xl`}
      >
        <div className="mb-3">
          <h2 className="text-center text-2xl font-medium">
            {status === 'finalized' && 'Finalized'}
            {status === 'ongoing' && 'Ongoing'}
            {status === 'open' && 'Open for betting'}
            {_isWon && (
              <span className="animate-pulse bg-yellow-500 text-white px-3 py-1 ml-2 rounded-full">
                Win
              </span>
            )}
            {_isLost && (
              <span className="animate-pulse bg-gray-200 text-white px-3 py-1 ml-2 rounded-full">
                Losе
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-300 text-center">
            {endingTimestamp
              ? new Date(endingTimestamp * 1000).toLocaleTimeString()
              : ''}
          </p>
        </div>

        <div className="-mx-2 flex-grow ">
          {status === 'open' ? (
            <PlaceBet
              betAmount={betAmount}
              handleBetAmount={handleBetAmount}
              handleBetDirection={handleBetDirection}
              isOpenForBetting={isOpenForBetting}
            />
          ) : (
            <BetChart classAlt="h-48" chart={chart} status={status} />
          )}
        </div>

        <div
          className={`${
            _isUp ? 'bg-green-100' : _isDown ? 'bg-red-100' : 'bg-white'
          } px-2 py-4 -mx-2 shadow-lg my-4 rounded-lg`}
        >
          <div className="flex -mx-2">
            <div className="px-2 w-1/2">
              <div className="flex flex-col items-center border-r">
                <span
                  className={`px-2 rounded-full text-white text-xs ${
                    initialPrice ? 'bg-gray-500' : 'bg-gray-200'
                  }`}
                >
                  Initial Price
                </span>
                <span
                  className={`font-digits text-xl xl:text-2xl ${
                    !initialPrice && 'text-gray-200'
                  }`}
                >
                  {initialPrice ? (
                    _initialPrice > 0 ? (
                      _initialPrice.toFixed(2)
                    ) : (
                      <IconSpinner className="spinner animate-spin mt-2 mb-2 h-5 w-5 text-gray" />
                    )
                  ) : (
                    '?'
                  )}
                </span>
                <span className={`text-xs`}>{global.config.pricesLabel}</span>
              </div>
            </div>
            <div className="px-2 w-1/2">
              <div className="flex flex-col items-center">
                <span
                  className={`px-2 rounded-full text-white text-xs ${
                    finalPrice ? 'bg-gray-500' : 'bg-gray-200'
                  }`}
                >
                  Final Price
                </span>
                <span
                  className={`font-digits text-xl xl:text-2xl ${
                    !finalPrice && 'text-gray-200'
                  }`}
                >
                  {finalPrice ? (
                    _finalPrice > 0 ? (
                      _finalPrice.toFixed(2)
                    ) : (
                      <IconSpinner className="spinner animate-spin mt-2 mb-2 h-5 w-5 text-gray" />
                    )
                  ) : (
                    '?'
                  )}
                </span>
                <span className={`text-xs`}>{global.config.pricesLabel}</span>
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
              <span className="text-xs text-gray-300 ml-2">
                {global.config.currencyName}
              </span>
            </div>
            <div className="flex items-center">
              <span className="flex-shrink-0 mr-2">
                <IconDown className="icon text-pink-500" />
              </span>
              <span className="font-digits text-xl xl:text-2xl text-pink-500">
                {poolTotalDown}
              </span>
              <span className="text-xs text-gray-300 ml-2">
                {global.config.currencyName}
              </span>
            </div>
          </div>
          <div className="px-2 flex-shrink-0">
            <BetPlaced
              betAmountContract={betAmountContract}
              betDirectionContract={betDirectionContract}
              isWon={_isWon}
              isLost={_isLost}
            />
          </div>
        </div>

        <hr className="my-4" />

        <div className="flex items-center">
          <span className="text-xs text-gray-300 w-1/4">Pool Size</span>
          <div className="w-3/4 flex items-center">
            <span className="font-digits text-xl xl:text-2xl">{poolSize}</span>
            <span className="text-xxs text-gray-300 ml-2">
              {global.config.currencyName}
            </span>
          </div>
        </div>

        <div className="flex items-center">
          <span className="text-xs text-gray-300 w-1/4">Accounts</span>
          <div className="w-3/4 flex items-center">
            <span className="font-digits text-xl xl:text-2xl">{accounts}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
