import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';

import { Header } from './Header';
import { Faq } from './Faq';
import { Help } from './Help';
import { ConnectMetamask } from './ConnectMetamask';
import Dashboard from './Dashboard';
import { Staking } from './Staking';
import { Container } from './Container';
import { Footer } from './Footer';

import {
  BettingProvider,
  CURRENCY_AVAX,
  CURRENCY_KITTY,
  CURRENCY_ETH,
} from '../context/BettingContext';
import { StakingProvider } from '../context/StakingContext';

// Google Analytics
import ReactGA from 'react-ga';

const RoutesComponent = () => {
  const { active } = useWeb3React();
  // Analytics configuration
  ReactGA.initialize('UA-220083391-1');
  ReactGA.pageview(window.location.pathname + window.location.search);

  if (!active)
    return (
      <div className="flex flex-col">
        <Router>
          <Header />
          <div className="pt-6 sm:pt-12 flex-grow flex flex-col">
            <Container>
              <Switch>
                <Route path="/faq">
                  <Faq />
                </Route>
                <Route path="/help">
                  <Help />
                </Route>
                <Route exact path="/">
                  <ConnectMetamask />
                </Route>
                <Route exact path="/avax">
                  <ConnectMetamask />
                </Route>
                <Route exact path="/kitty">
                  <ConnectMetamask />
                </Route>
                <Route exact path="/daily">
                  <ConnectMetamask />
                </Route>
                <Route path="/staking">
                  <ConnectMetamask />
                </Route>
                <Route exact path="/flippening">
                  <ConnectMetamask />
                </Route>
              </Switch>
            </Container>
          </div>
          <Footer />
        </Router>
      </div>
    );

  return (
    <div className="flex flex-col">
      <Router>
        <Header connected="true" />
        <div className="pt-6 sm:pt-12 flex-grow flex flex-col">
          <Container>
            <Switch>
              <Route path="/faq">
                <Faq />
              </Route>
              <Route path="/help">
                <Help />
              </Route>
              <Route exact path="/">
                <BettingProvider>
                  <Dashboard />
                </BettingProvider>
              </Route>
              <Route exact path="/avax">
                <BettingProvider currency={CURRENCY_AVAX}>
                  <Dashboard />
                </BettingProvider>
              </Route>
              <Route exact path="/kitty">
                <BettingProvider currency={CURRENCY_KITTY}>
                  <Dashboard />
                </BettingProvider>
              </Route>
              <Route exact path="/daily">
                <BettingProvider currency={CURRENCY_KITTY} timeWindow={1440}>
                  <Dashboard />
                </BettingProvider>
              </Route>
              <Route exact path="/flippening">
                <BettingProvider currency={CURRENCY_ETH} timeWindow={1440}>
                  <Dashboard />
                </BettingProvider>
              </Route>
              <Route path="/staking">
                <StakingProvider>
                  <Staking />
                </StakingProvider>
              </Route>
              <Route path="/flippening/staking">
                <StakingProvider currency={CURRENCY_ETH}>
                  <Staking />
                </StakingProvider>
              </Route>
            </Switch>
          </Container>
        </div>
        <Footer />
      </Router>
    </div>
  );
};

const ConnectedRoutesComponent = RoutesComponent;

export const App = (props) => {
  return <ConnectedRoutesComponent />;
};

export default App;
