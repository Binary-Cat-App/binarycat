import React from 'react';
import { Button } from './Button';
import { ReactComponent as IconUp } from '../assets/images/icon-up.svg';
import { ReactComponent as IconDown } from '../assets/images/icon-down.svg';
import NumberFormat from 'react-number-format';
import { useAuth } from '../context/AuthContext';

export const PlaceBet = ({
  betAmount,
  betDirection,
  handleBetAmount,
  handleBetDirection,
}) => {
  const { currentUser } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <Button
        variant="green"
        className="w-full p-4 rounded-b-none"
        gradient
        handleClick={() => {
          handleBetDirection('up');
        }}
        isDisabled={!currentUser}
      >
        <IconUp className="icon w-16 h-auto" />
      </Button>
      <div className="min-w-0 py-2 px-4 flex items-center bg-gray-100">
        <NumberFormat
          value={betAmount}
          onChange={handleBetAmount}
          thousandSeparator=" "
          decimalSeparator="."
          decimalScale="2"
          fixedDecimalScale="2"
          allowNegative="false"
          className="form-control font-digits text-xl xl:text-2xl border-0 bg-transparent text-center "
          disabled={!currentUser}
        />

        <label htmlFor="betAmount" className="ml-2 text-lg flex-shrink-0">
          ETH
        </label>
      </div>
      <Button
        variant="pink"
        gradient
        className="w-full p-4 rounded-t-none"
        handleClick={() => {
          handleBetDirection('down');
        }}
        isDisabled={!currentUser}
      >
        <IconDown className="icon w-16 h-auto" />
      </Button>
    </div>
  );
};
