import React from 'react';
import { ReactComponent as IconWinningPercentage } from '../assets/images/icon-winning-percantage.svg';
import { ReactComponent as IconTotalWinnings } from '../assets/images/icon-total-winnings.svg';
import { ReactComponent as IconBallance } from '../assets/images/icon-ballance.svg';
import { useMetaMask } from '../context/MataMaskContext';
import { useDrizzle } from '../context/DrizzleContext';

export const UserSummary = () => {
  const { ethAccount } = useMetaMask();
  const { drizzleReadinessState, drizzle } = useDrizzle();
  const contract = React.useMemo(() => {
    return drizzle.contracts.BinaryBet;
  }, [drizzle.contracts]);

  const balance = React.useMemo(() => {
    if (
      drizzleReadinessState.loading === false &&
      drizzleReadinessState.drizzleState.contracts.BinaryBet.getBalance
    ) {
      const balKey = contract.methods['getBalance'].cacheCall(ethAccount);
      const bal =
        drizzleReadinessState.drizzleState.contracts.BinaryBet.getBalance[
          balKey
        ];
      if (bal) {
        if (bal.value) {
          const ethBal =
            Math.round(drizzle.web3.utils.fromWei(bal.value, 'ether') * 100) /
            100;
          return ethBal;
        }
      }
    }
    return 0;
  }, [
    contract.methods,
    drizzleReadinessState.loading,
    drizzleReadinessState.drizzleState.contracts.BinaryBet,
    drizzle.web3.utils,
    ethAccount,
  ]);

  return (
    <div className="flex w-2/3">
      <div className="px-4 w-1/3">
        <div className="flex">
          <span className="mr-4">
            <IconWinningPercentage className="icon" />
          </span>
          <dl>
            <dt className="leading-none">Winning percentage</dt>
            <dd className="text-2xl font-black text-gray-900">53 %</dd>
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
            <dd className="text-2xl font-black text-gray-900">2 ETH</dd>
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
              {balance.toFixed(2)} ETH
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};
