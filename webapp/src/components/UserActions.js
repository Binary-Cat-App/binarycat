import React from 'react';

import MetaMaskLogo from '../assets/images/metamask.svg';
import { ModalDeposit } from './ModalDeposit';
import { ModalWithdraw } from './ModalWithdraw';
import { useDrizzle } from '../context/DrizzleContext';
import { useMetaMask } from '../context/MataMaskContext';
import { Button } from './Button';

export const UserActions = () => {
  const { ethAccount } = useMetaMask();
  const { drizzleReadinessState, drizzle, currentBlock } = useDrizzle();

  React.useEffect(() => {
    console.log(currentBlock);
  }, [currentBlock]);

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
          balance={balance}
          onWithdraw={(value) => {
            handleWithdraw(value);
          }}
        />
      </div>
    </div>
  );
};
