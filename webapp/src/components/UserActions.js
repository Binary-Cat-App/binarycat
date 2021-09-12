import React, { useState } from 'react';

import { useBetting } from '../context/BettingContext';
import { Button } from './Button';

export const UserActions = () => {
  const {
    currentBlock,
    account,
    active,
    weiToCurrency,
    currencyToWei,
    contractObj
  } = useBetting();

  const [effect, setEffect] = useState(false);

  const handleUpdateBalance = async () => {

    setEffect(true);

    if ( active && account ) {
      const update = await contractObj.methods
        .updateBalance()
        .send({
          from: account
        });

      if( update )setEffect(false);
    }
  };

  return (
    <div className="px-4 ml-auto">
      <div className="flex">
        <Button 
          className={`${
            effect && "animate-ping"
          } w-full`} 
          variant="green" 
          handleClick={handleUpdateBalance}
          onAnimationEnd={() => setEffect(false)}
          >
          Claim
        </Button>
      </div>
    </div>
  );
};
