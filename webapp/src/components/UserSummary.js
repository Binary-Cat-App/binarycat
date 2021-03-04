import React from 'react';
import { ReactComponent as IconWinningPercentage } from '../assets/images/icon-winning-percantage.svg';
import { ReactComponent as IconTotalWinnings } from '../assets/images/icon-total-winnings.svg';
import { ReactComponent as IconBallance } from '../assets/images/icon-ballance.svg';
import { useMetaMask } from '../context/MataMaskContext';
import { useDrizzle } from '../context/DrizzleContext';

export const UserSummary = () => {
  const { ethAccount } = useMetaMask();
  const { 
    drizzleReadinessState, 
    drizzle,
    totalWinnings,
    winningPercentage,
    balance,
  } = useDrizzle();
  const contract = React.useMemo(() => {
    return drizzle.contracts.BinaryBet;
  }, [drizzle.contracts]);

  return (
    <div className="flex w-2/3">
      <div className="px-4 w-1/3">
        <div className="flex">
          <span className="mr-4">
            <IconWinningPercentage className="icon" />
          </span>
          <dl>
            <dt className="leading-none">Winning percentage</dt>
            <dd className="text-2xl font-black text-gray-900">
              {winningPercentage} %
            </dd>
          </dl>
        </div>
      </div>
      <div className="px-4 w-1/3">
        <div className="flex">
          <span className="mr-4">
            <IconTotalWinnings className="icon" />
          </span>
          <dl>
            <dt className="leading-none">Total Winnings</dt>
            <dd className="text-2xl font-black text-gray-900">
              {totalWinnings} {global.config.currencyName}
            </dd>
          </dl>
        </div>
      </div>
      <div className="px-4 w-1/3">
        <div className="flex">
          <span className="mr-4">
            <IconBallance className="icon" />
          </span>
          <dl>
            <dt className="leading-none">Balance</dt>
            <dd className="text-2xl font-black text-gray-900">
              {balance} {global.config.currencyName}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};
