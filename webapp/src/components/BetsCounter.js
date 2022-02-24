import React from 'react';
import { ReactComponent as IconUp } from '../assets/images/icon-up.svg';
import { ReactComponent as IconDown } from '../assets/images/icon-down.svg';
import { BadgeLost, BadgeWin, BetBadge } from './BetBadge';

import { ReactComponent as IconWinner } from '../assets/images/icon-winner.svg';

export const BetsCounter = ({
  poolTotalUp,
  poolTotalDown,
  upWin,
  downWin,
  selectedCurrency,
}) => {
  return (
    <div className="px-2 flex-grow">
      <div className="flex items-center">
        {upWin && (
          <span className="flex-shrink-0 mr-2">
            <BadgeWin></BadgeWin>
          </span>
        )}
        {downWin && <span className="flex-shrink-0 mr-2"></span>}
        <span className="flex-shrink-0 mr-2">
          <IconUp className="icon text-green-500" />
        </span>
        <span className="font-digits text-xl xl:text-2xl text-green-500">
          {poolTotalUp}
        </span>
        <span className="text-xs text-gray-300 ml-2">{selectedCurrency}</span>
      </div>
      <div className="flex items-center">
        {downWin && (
          <span className="flex-shrink-0 mr-2">
            <BadgeWin></BadgeWin>
          </span>
        )}
        {upWin && <span className="flex-shrink-0 mr-2"></span>}
        <span className="flex-shrink-0 mr-2">
          <IconDown className="icon text-pink-500" />
        </span>
        <span className="font-digits text-xl xl:text-2xl text-pink-500">
          {poolTotalDown}
        </span>
        <span className="text-xs text-gray-300 ml-2">{selectedCurrency}</span>
      </div>
    </div>
  );
};
