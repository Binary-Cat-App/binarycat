import React from 'react';

import MetaMaskLogo from '../assets/images/metamask.svg';
import { ModalDeposit } from './ModalDeposit';
import { ModalWithdraw } from './ModalWithdraw';
import { useDrizzle } from '../context/DrizzleContext';
import { useMetaMask } from '../context/MataMaskContext';
import { Button } from './Button';

export const UserActions = () => {
  const { ethAccount } = useMetaMask();
  const { drizzleReadinessState, drizzle } = useDrizzle();
  const contract = React.useMemo(() => {
    return drizzle.contracts.BinaryBet;
  }, [drizzle.contracts]);

  const handleDeposit = (value) => {
    const eth = parseInt(drizzle.web3.utils.toWei(value, 'ether'));
    contract.methods['deposit'].cacheSend({
      from: ethAccount,
      value: eth,
    });
  };
  const handleWithdraw = (value) => {
    const eth = drizzle.web3.utils.toWei(value, 'ether');
    contract.methods['withdraw'].cacheSend(eth, {
      from: ethAccount,
    });
  };

  // const balance = React.useMemo(() => {
  //   const bal = contract.methods['getBalance'].cacheCall(ethAccount);
  //   console.log('BALANCE', parseInt(bal));
  //   console.log(drizzle.web3.utils);
  //   return 10;
  // }, [drizzle]);
  return (
    <div className="px-4 ml-auto">
      <div className="flex items-center mb-1">
        <span className="text-xxs text-gray-300 mr-1">Connect with</span>
        <span className="flex-shrink-0">
          <img src={MetaMaskLogo} className="w-24" alt="" />
        </span>
      </div>
      <div className="flex">
        {/*<Button variant="default" handleClick={handleDeposit}>
          Deposit
        </Button>
        <Button
          variant="default"
          outline
          className="ml-4"
          handleClick={handleWithdraw}
        >
          Withdraw
        </Button>*/}
        <ModalDeposit
          onDeposit={(value) => {
            handleDeposit(value);
          }}
        />
        <ModalWithdraw
          onWithdraw={(value) => {
            handleWithdraw(value);
          }}
        />
      </div>
    </div>
  );
};
