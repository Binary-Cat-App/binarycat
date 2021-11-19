import React, { useState } from 'react';

import { useBetting } from '../context/BettingContext';
import { Button } from './Button';
import { ReactComponent as IconSpinner } from '../assets/images/icon-spinner.svg';

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
        .updateBalance(account)
        .send({
          from: account
        });

      if( update )setEffect(false);
    }
  };

  return (
    <div className="flex w-full md:w-1/5 px-4 pt-4 md:pt-0">
      <Button 
        className="w-full"
        variant="green" 
        handleClick={handleUpdateBalance}
        onAnimationEnd={() => setEffect(false)}
        >
        Claim
        { effect && <IconSpinner className="spinner animate-spin ml-2 h-5 w-5 text-gray" /> }
      </Button>
    </div>
  );
};
