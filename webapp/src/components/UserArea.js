import React from 'react';
import { UserSummary } from './UserSummary';
import { UserActions } from './UserActions';
import { UserGuest } from './UserGuest';
import { useAuth } from '../context/AuthContext';

export const UserArea = () => {
  const { currentUser } = useAuth();

  return currentUser ? (
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
