import React from 'react';

import MetaMaskLogo from '../assets/images/metamask.svg';
import { ModalDeposit } from './ModalDeposit';
import { ModalWithdraw } from './ModalWithdraw';
import { useDrizzle } from '../context/DrizzleContext';
import { Button } from './Button';

export const UserActions = () => {
  const {
    drizzleReadinessState,
    drizzle,
    currentBlock,
    balance,
    weiToCurrency,
    currencyToWei
  } = useDrizzle();

  const contract = React.useMemo(() => {
    return drizzle.contracts.BinaryBet;
  }, [drizzle.contracts]);

  const handleDeposit = (value) => {
    if (drizzleReadinessState.drizzleState.accounts) {

      const contract = drizzle.contracts.BinaryBet;
      const web3 = drizzle.web3;
      const contractWeb3 = new web3.eth.Contract(
        contract.abi,
        contract.address
      );

      contractWeb3.methods
        .deposit()
        .send({
          from: drizzleReadinessState.drizzleState.accounts[0],
          value: currencyToWei(value)
        });
    }
  };

  const handleWithdraw = (value) => {
    if (drizzleReadinessState.drizzleState.accounts) {

      const contract = drizzle.contracts.BinaryBet;
      const web3 = drizzle.web3;
      const contractWeb3 = new web3.eth.Contract(
        contract.abi,
        contract.address
      );

      contractWeb3.methods
        .withdraw( currencyToWei(value) )
        .send({
          from: drizzleReadinessState.drizzleState.accounts[0]
        });
    }
  };

  return (
    <div className="px-4 ml-auto">
      <div className="flex items-center mb-1">
        <span className="text-xxs text-gray-300 mr-1">Connect with</span>
        <span className="flex-shrink-0">
          <img src={MetaMaskLogo} className="w-24" alt="" />
        </span>
      </div>
      <div className="flex">
        <ModalDeposit
          onDeposit={(value) => {
            handleDeposit(value);
          }}
        />
        <ModalWithdraw
          balance={balance}
          onWithdraw={(value) => {
            handleWithdraw(value);
          }}
        />
      </div>
    </div>
  );
};
