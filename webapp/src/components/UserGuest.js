import React from 'react';
import { Button } from './Button';
import MetaMaskLogo from '../assets/images/metamask.svg';
// import { useAuth } from '../context/AuthContext';
import { useMetaMask } from '../context/MataMaskContext';
import { useState } from 'react';

export const UserGuest = () => {
  const [isLoading] = useState(false);
  // const { signUp } = useAuth();
  // const { connectMataMask } = useMetaMask();

  // async function handleSignUp() {
  //   setIsLoading(true);
  //   await new Promise((resolve) => setTimeout(resolve, 1000));
  //   signUp();
  //   setIsLoading(false);
  // }

  return (
    <div className="w-full px-4 max-w-xl mx-auto">
      <p className="text-center">
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
            // connectMataMask();
          }}
          isLoading={isLoading}
        >
          Connect my wallet
        </Button>
      </p>
    </div>
  );
};
