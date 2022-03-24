import React from 'react';
import ReactDOM from 'react-dom';
import { Web3ReactProvider } from '@web3-react/core';
import Web3 from 'web3';

import WebFontLoader from 'webfontloader';
import './assets/css/app.css';
import './config/globals';
import './config/windowOptions';

import App from './components/App';
import MetamaskProvider from './components/MetamaskProvider';

function getLibrary(provider) {
  return new Web3(provider);
}

WebFontLoader.load({
  google: {
    families: ['Work+Sans:400,500,900', 'DM+Mono:500'],
  },
});

ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <MetamaskProvider>
        <App />
      </MetamaskProvider>
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
