import React from 'react';
import { Button } from './Button';
import MetaMaskLogo from '../assets/images/metamask.svg';
import { useDrizzle } from '../context/DrizzleContext';
import { useMetaMask } from '../context/MataMaskContext';

export const UserActions = () => {
  const { ethAccount } = useMetaMask();
  const { drizzleReadinessState, drizzle } = useDrizzle();
  const contract = React.useMemo(() => {
    return drizzle.contracts.BinaryBet;
  }, [drizzle.contracts]);

  const handleDeposit = () => {
    contract.methods['deposit'].cacheSend();
    // contract.events['newDeposit'](1, ethAccount).subscribe((data) => {
    //   console.log(data);
    // });
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
        <Button variant="default" handleClick={handleDeposit}>
          Deposit
        </Button>
        <Button
          variant="default"
          outline
          className="ml-4"
          handleClick={() => console.log('Withdraw')}
        >
          Withdraw
        </Button>
      </div>
    </div>
  );
};
