import React, { useState } from 'react';
import { Button } from './Button';
import { CURRENCY_AVAX, CURRENCY_KITTY } from '../context/BettingContext';
import SelectButton from './SelectButton';
import { ReactComponent as IconAvax } from '../assets/images/avax-logo.svg';
import { ReactComponent as IconKitty } from '../assets/images/small-binary-transp.svg';

export const ControlBar = ({
  selectedCurrency,
  selectCurrency,
  selectedWindowTime,
  selectWindowTime,
}) => {
  const selectAvax = () => {
    localStorage.removeItem('selectedWindowTime');
    selectCurrency('AVAX');
  };

  const selectKitty = () => {
    localStorage.removeItem('selectedWindowTime');
    selectCurrency('KITTY');
  };

  const onWindowTimeSelected = (value) => {
    console.log(value);
    localStorage.setItem('selectedWindowTime', value.value);
    selectWindowTime(value.value);
  };

  return (
    <div className="w-full rounded-2xl px-0 py-4 lg:w mb-10  flex-shrink-0">
      <div className="h-full flex flex-row relative rounded-2xl">
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
      <div className="h-full flex flex-row relative rounded-2xl mt-4">
        <SelectButton
          options={
            !selectedCurrency
              ? []
              : global.currencyWindows.timeOptions[selectedCurrency]
          }
          selectedValue={selectedWindowTime}
          className="btn-select"
          placeholder={'Selecione'}
          onChange={onWindowTimeSelected}
        ></SelectButton>

        {/* <Button
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
        </Button> */}
      </div>
    </div>
  );
};
