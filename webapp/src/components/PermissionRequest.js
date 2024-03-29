import React, { useState } from 'react';
import { Button } from './Button';
import { Loading } from './Loading';

export const PermissionRequest = ({
  selectedCurrency,
  permissionRequested,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleAllowance = () => {
    setIsLoading(true);
    permissionRequested();
  };
  return (
    <div className="w-full lg:w mb-4 lg:mb-0 p-8  bg-white flex flex-col rounded-3xl">
      {isLoading ? (
        <Loading></Loading>
      ) : (
        <Button
          variant="green"
          size="normal"
          className="w-full py-3 text-xl mb-8"
          handleClick={() => {
            handleAllowance();
          }}
        >
          Allow bets with {selectedCurrency}
        </Button>
      )}
    </div>
  );
};

export default PermissionRequest;
