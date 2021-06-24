import React from 'react';
import { ReactComponent as IconWinner } from '../assets/images/icon-winner.svg';
import { ReactComponent as IconLoser } from '../assets/images/icon-loser.svg';

export const BetBadge = ({ isWon, isLost }) => {
  return (
    <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4">
      {isWon && (
        <span className="bg-yellow-500 animate-pulse p-1 w-8 h-8 flex items-center justify-center rounded-full shadow-lg">
          <IconWinner />
        </span>
      )}
      {isLost && (
        <span className="bg-gray-200 animate-bounce p-1 w-8 h-8 flex items-center justify-center rounded-full shadow-lg">
          <IconLoser className="text-white" />
        </span>
      )}
    </div>
  );
};
