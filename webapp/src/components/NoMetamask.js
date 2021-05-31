import React from 'react';
import MetaMaskLogo from '../assets/images/metamask.svg';

export const NoMetamask = () => {
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
        <a href="https://metamask.io/download.html" rel="nofollow" className="btn btn--default py-3 text-xl w-full">
          Download MetaMask
        </a>
      </p>
    </div>
  );
};
