import React from 'react';

import MetaMaskLogo from '../assets/images/metamask.svg';
import { ModalDeposit } from './ModalDeposit';
import { ModalWithdraw } from './ModalWithdraw';

export const UserActions = () => {
  return (
    <div className="px-4 ml-auto">
      <div className="flex items-center mb-1">
        <span className="text-xxs text-gray-300 mr-1">Connect with</span>
        <span className="flex-shrink-0">
          <img src={MetaMaskLogo} className="w-24" alt="" />
        </span>
      </div>
      <div className="flex">
        <ModalDeposit />
        <ModalWithdraw />
      </div>
    </div>
  );
};
