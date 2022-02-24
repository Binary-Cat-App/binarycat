import React, { useState } from 'react';
import { Button } from './Button';
import { CURRENCY_AVAX, CURRENCY_KITTY } from '../context/BettingContext';
import SelectButton from './SelectButton';

export const ControlBar = ({ selectedCurrency, selectCurrency }) => {
  const options = [
    { value: CURRENCY_AVAX, label: 'Avax' },
    { value: CURRENCY_KITTY, label: 'Kitty' },
  ];

  const selectAvax = () => {
    selectCurrency('AVAX');
  };

  const selectKitty = () => {
    selectCurrency('KITTY');
  };

  return (
    <div className="w-full bg-white rounded-2xl px-4 py-4 lg:w mb-10  flex-shrink-0">
      <div className="h-full flex flex-row relative rounded-2xl">
        <SelectButton
          options={options}
          selectedCurrency={selectedCurrency}
          className="btn-select"
        ></SelectButton>

        <Button
          className={`btn  mr-3 ${
            selectedCurrency === 'AVAX' ? '' : 'btn--outline'
          }`}
          variant="blue"
          handleClick={selectAvax}
        >
          bet{selectedCurrency === 'AVAX' ? 'ing' : ''} with AVAX 🔺
        </Button>
        <Button
          className={`btn  mr-3 ${
            selectedCurrency === 'KITTY' ? '' : 'btn--outline'
          }`}
          variant="blue"
          handleClick={selectKitty}
        >
          bet{selectedCurrency === 'KITTY' ? 'ing' : ''} with KITTY 🐱
        </Button>
      </div>
      <div className="h-full flex flex-row relative rounded-2xl">
        <Button
          className={`btn  mr-3 mt-4 btn--outline `}
          variant="blue"
          handleClick={selectKitty}
        >
          🕐 5 Minutes Window
        </Button>
        <Button
          className={`btn  mr-3 mt-4 btn--outline `}
          variant="blue"
          handleClick={selectKitty}
        >
          🕐 24 Hours Window
        </Button>
      </div>
    </div>
  );
};
