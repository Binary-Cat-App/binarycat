import React from 'react';
import { Button } from './Button';
import { useState } from 'react';
import MetaMaskLogo from '../assets/images/metamask.svg';

export const LoadingMetamask = () => {
  const [isLoading] = useState(false);

  return (
  	<div className="w-full px-4 max-w-xl mx-auto">
      <h2 className="text-center">
      	This application requires
     	</h2>

      <p className="text-center pb-6">
        <a href="https://metamask.io/" rel="nofollow">
          <img src={MetaMaskLogo} className="w-48 mx-auto" alt="" />
        </a>
      </p>

			<p className="text-center">
        <Button
          variant="default"
          size="normal"
          className="py-3 text-xl w-full"
          handleClick={() => {
            window.location.reload();
          }}
          isLoading={isLoading}
        >
          Connect my wallet
        </Button>
      </p>
    </div>
  );
};
