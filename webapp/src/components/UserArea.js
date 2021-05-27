import React from 'react';
import { UserSummary } from './UserSummary';
import { UserActions } from './UserActions';
import { UserGuest } from './UserGuest';
import { useMetaMask } from '../context/MataMaskContext';

export const UserArea = () => {
  const { ethAccount } = useMetaMask();

  return ethAccount ? (
    <div className="flex -mx-4 justify-between items-end mb-8">
      <UserSummary />
      <UserActions />
    </div>
  ) : (
    <div className="flex -mx-4 justify-between items-center mb-8">
      <UserGuest />
    </div>
  );
};
