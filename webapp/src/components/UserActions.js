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
    const eth = parseInt(drizzle.web3.utils.toWei('3.125', 'ether'));
    contract.methods['deposit'].cacheSend({
      from: ethAccount,
      value: eth,
    });
  };
  const handleWithdraw = () => {
    const eth = drizzle.web3.utils.toWei('0.3', 'ether');
    console.log(eth);
    contract.methods['withdraw'].cacheSend(eth, {
      from: ethAccount,
    });
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
          handleClick={handleWithdraw}
        >
          Withdraw
        </Button>
      </div>
    </div>
  );
};
