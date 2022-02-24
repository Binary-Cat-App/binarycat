import React, { useState } from 'react';
import { Button } from './Button';
import { CURRENCY_AVAX, CURRENCY_KITTY } from '../context/BettingContext';
import SelectButton from './SelectButton';
import { ReactComponent as IconAvax } from '../assets/images/avax-logo.svg';
import { ReactComponent as IconKitty } from '../assets/images/small-binary-transp.svg';

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
          Bet{selectedCurrency === 'AVAX' ? 'ting' : ''} with AVAX
          <IconAvax width={44} />
        </Button>
        <Button
          className={`btn  mr-3 ${
            selectedCurrency === 'KITTY' ? '' : 'btn--outline'
          }`}
          variant="blue"
          handleClick={selectKitty}
        >
          Bet{selectedCurrency === 'KITTY' ? 'ting' : ''} with KITTY
          <IconKitty width={32} className="ml-2" />
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
