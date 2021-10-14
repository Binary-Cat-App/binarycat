import React, { useState } from 'react';
import { useWeb3React } from "@web3-react/core";
import { injected } from "./Connectors";

import { Button } from './Button';
import MetaMaskLogo from '../assets/images/metamask.svg';

export const ConnectMetamask = () => {
  
  const [isLoading] = useState(false);
  const { active, account, library, connector, activate, deactivate } = useWeb3React();

  async function connect() {
    try {
      await activate(injected)
    } catch (ex) {
      console.log(ex)
    }
  }

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
          handleClick={connect}
          isLoading={isLoading}
        >
          Connect my wallet
        </Button>
      </p>
    </div>
  );
};