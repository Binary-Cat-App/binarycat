import React, { useState } from 'react';
import { Button } from './Button';

export const ControlBar = ({ selectedCurrency, selectCurrency }) => {
  const selectAvax = () => {
    selectCurrency('AVAX');
  };

  const selectKitty = () => {
    selectCurrency('KITTY');
  };

  return (
    <div className="w-full lg:w mb-10  flex-shrink-0">
      <div className="h-full flex flex-row relative rounded-2xl">
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
    </div>
  );
};
