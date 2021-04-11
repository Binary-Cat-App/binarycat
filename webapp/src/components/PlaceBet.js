import React from 'react';
import { Button } from './Button';
import { ReactComponent as IconUp } from '../assets/images/icon-up.svg';
import { ReactComponent as IconDown } from '../assets/images/icon-down.svg';
import NumberFormat from 'react-number-format';
import { useMetaMask } from '../context/MataMaskContext';

export const PlaceBet = ({
  betAmount,
  betDirection,
  handleBetAmount,
  handleBetDirection,
  isOpenForBetting,
}) => {
  const { ethAccount } = useMetaMask();

  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <Button
        variant="green"
        outline
        className="w-full p-4 rounded-t-lg rounded-b-none"
        handleClick={() => {
          handleBetDirection('up');
        }}
        isDisabled={!ethAccount || !isOpenForBetting}
      >
        <IconUp className="icon w-16 h-auto" />
      </Button>
      <div
        className={`min-w-0 py-2 px-4 flex items-center bg-white border-l border-r border-gray-200 relative ${
          (!ethAccount || !isOpenForBetting) && 'bg-gray-100 '
        }`}
      >
        <NumberFormat
          value={betAmount}
          onValueChange={(values) => {
            handleBetAmount(values.formattedValue);
          }}
          thousandSeparator=" "
          decimalSeparator="."
          decimalScale="2"
          fixedDecimalScale="2"
          allowNegative="false"
          className="form-control font-digits text-xl xl:text-2xl border-0 bg-transparent text-center px-10"
          disabled={!ethAccount || !isOpenForBetting}
        />

        <label
          htmlFor="betAmount"
          className="mr-4 right-0 absolute text-lg flex-shrink-0"
        >
          {global.config.currencyName}
        </label>
      </div>
      <Button
        variant="pink"
        outline
        className="w-full p-4 rounded-b-lg rounded-t-none"
        handleClick={() => {
          handleBetDirection('down');
        }}
        isDisabled={!ethAccount || !isOpenForBetting}
      >
        <IconDown className="icon w-16 h-auto" />
      </Button>
    </div>
  );
};
