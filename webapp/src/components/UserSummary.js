import React from 'react';
import { ReactComponent as IconWinningPercentage } from '../assets/images/icon-winning-percantage.svg';
import { ReactComponent as IconTotalWinnings } from '../assets/images/icon-total-winnings.svg';
import { ReactComponent as IconBallance } from '../assets/images/icon-ballance.svg';
import { useDrizzle } from '../context/DrizzleContext';

export const UserSummary = () => {
  
  const { 
    drizzleReadinessState, 
    drizzle,
    totalWinnings,
    winningPercentage,
    balance,
    unsettledGains
  } = useDrizzle();
  
  const _balance = balance + unsettledGains;

  const contract = React.useMemo(() => {
    return drizzle.contracts.BinaryBet;
  }, [drizzle.contracts]);

  return (
    <div className="flex mr-auto">
      <div className="px-4">
        <div className="flex items-center">
          <span className="-mr-8 rounded-full bg-white p-4 shadow-xl w-20 h-20 flex items-center justify-center flex-shrink-0 z-10 relative">
            <IconWinningPercentage />
          </span>
          <dl className="px-8 py-3 pl-12  bg-white rounded-r-3xl">
            <dt className="leading-none whitespace-no-wrap">
              Winning Percentage
            </dt>
            <dd className="text-2xl font-black text-green-500 leading-none">
              {winningPercentage} %
            </dd>
          </dl>
        </div>
      </div>
      <div className="px-4">
        <div className="flex items-center">
          <span className="-mr-8 rounded-full bg-white p-4 shadow-xl w-20 h-20 flex items-center justify-center flex-shrink-0 z-10 relative">
            <IconTotalWinnings />
          </span>
          <dl className="px-8 py-3 pl-12  bg-white rounded-r-3xl">
            <dt className="leading-none whitespace-no-wrap">Total Winnings</dt>
            <dd className="text-2xl font-black text-green-500 leading-none">
              {totalWinnings.toFixed(2)} {global.config.currencyName}
            </dd>
          </dl>
        </div>
      </div>
      <div className="px-4">
        <div className="flex items-center">
          <span className="-mr-8 rounded-full bg-white p-4 shadow-xl w-20 h-20 flex items-center justify-center flex-shrink-0 z-10 relative">
            <IconBallance />
          </span>
          <dl className="px-8 py-3 pl-12  bg-white rounded-r-3xl">
            <dt className="leading-none whitespace-no-wrap">Balance</dt>
            <dd className="text-2xl font-black text-green-500 leading-none">
              {_balance.toFixed(2)} {global.config.currencyName}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};
