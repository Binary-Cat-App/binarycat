import React from 'react';
import { ReactComponent as IconUp } from '../assets/images/icon-up.svg';
import { ReactComponent as IconDown } from '../assets/images/icon-down.svg';
import { ReactComponent as IconNoDirection } from '../assets/images/icon-no-direction.svg';
import { BetBadge } from './BetBadge';

export const BetPlaced = ({ betAmount, betDirection, isWon, isLost }) => {
  return (
    <>
      <p className="text-xxs text-gray-300 mb-1">My bet</p>
      <div
        className={`border rounded-sm py-1 px-4 flex flex-col items-center relative bg-gray-50 border-gray-100 ${
          betDirection === 'up' && 'bg-green-100 border-green-500'
        } ${betDirection === 'down' && 'bg-pink-100 border-pink-500'}`}
      >
        <BetBadge isWon={isWon} isLost={isLost} />
        <span>
          {betDirection === 'up' && <IconUp className="icon text-green-300" />}
          {betDirection === 'down' && (
            <IconDown className="icon text-pink-300" />
          )}
          {!betDirection && <IconNoDirection className="icon text-gray-300" />}
        </span>
        <span
          className={`font-digits text-xl xl:text-2xl ${
            !betAmount && 'text-gray-300'
          }`}
        >
          {betAmount ? betAmount : '0.00'}
        </span>
      </div>
    </>
  );
};
