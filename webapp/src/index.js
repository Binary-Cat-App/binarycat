import React from 'react';
import ReactDOM from 'react-dom';

import './assets/css/app.css';
import './config/globals';

import App from './components/App';
import WebFontLoader from 'webfontloader';

import { Drizzle, generateStore } from '@drizzle/store';
import drizzleOptions from './drizzleOptions.js';

const drizzle = new Drizzle(drizzleOptions);

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
