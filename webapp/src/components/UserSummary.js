import React from 'react';
import { ReactComponent as IconWinningPercentage } from '../assets/images/icon-winning-percantage.svg';
import { ReactComponent as IconTotalWinnings } from '../assets/images/icon-ballance.svg';
import { useBetting } from '../context/BettingContext';

export const UserSummary = () => {
  
  const { 
    unsettledGains,
    unsettledKITTY,
    weiToCurrency
  } = useBetting();

  const _unsettledGains = unsettledGains ? weiToCurrency(unsettledGains) : 0.00;
  const _unsettledKITTY = unsettledKITTY ? unsettledKITTY : 0.00;

  return (
    <div className="flex">
      <div className="px-2 md:px-4">
        <div className="flex items-center">
          <span className="hidden lg:flex -mr-8 rounded-full bg-white p-4 shadow-xl w-20 h-20 flex items-center justify-center flex-shrink-0 z-10 relative">
            <IconTotalWinnings />
          </span>
          <dl className="px-4 md:px-8 py-3 lg:pl-12 bg-white rounded-3xl lg:rounded-r-3xl">
            <dt className="leading-none whitespace-no-wrap">
              Unclaimed Gains
            </dt>
            <dd className="text-xl lg:text-2xl font-black text-green-500 leading-none">
              {_unsettledGains.toFixed(2)} {global.config.currencyName}
            </dd>
          </dl>
        </div>
      </div>
      <div className="px-2 md:px-4">
        <div className="flex items-center">
          <span className="hidden lg:flex -mr-8 rounded-full bg-white p-4 shadow-xl w-20 h-20 flex items-center justify-center flex-shrink-0 z-10 relative">
            <IconWinningPercentage />
          </span>
          <dl className="px-4 md:px-8 py-3 lg:pl-12 bg-white rounded-3xl lg:rounded-r-3xl">
            <dt className="leading-none whitespace-no-wrap">
              Unclaimed KITTY
            </dt>
            <dd className="text-xl lg:text-2xl font-black text-green-500 leading-none">
              {_unsettledKITTY.toFixed(2)} KITTY
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};
