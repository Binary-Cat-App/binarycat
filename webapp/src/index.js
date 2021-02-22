import React from 'react';
import ReactDOM from 'react-dom';
import './assets/css/app.css';
import App from './components/App';
import WebFontLoader from 'webfontloader';
import { Drizzle, generateStore } from '@drizzle/store';
import BinaryBet from './contracts/BinaryBet.json';
import './config/globals';

const options = {
  contracts: [BinaryBet],
  events: {
    BinaryBet: ['newBet', 'newDeposit', 'newWithdraw', 'betSettled'],
  },

  web3: {
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:9545',
    },
  },
};

const drizzle = new Drizzle(options);

WebFontLoader.load({
  google: {
    families: ['Roboto:400,500,900', 'DM+Mono:500'],
  },
});
ReactDOM.render(
  <React.StrictMode>
    <App drizzle={drizzle} />
  </React.StrictMode>,
  document.getElementById('root')
);
