import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { useWeb3React } from "@web3-react/core";

import { Header } from './Header';
import { Faq } from './Faq';
import { ConnectMetamask } from './ConnectMetamask';
import Dashboard from './Dashboard';
import { Staking } from './Staking';
import { Container } from './Container';

import { BettingProvider } from '../context/BettingContext';
import { StakingProvider } from '../context/StakingContext';

const RoutesComponent = () => {
  
  const { active } = useWeb3React();

  if ( !active )
    return (
      <div className="min-h-screen flex flex-col">
        <Router>
          <Header />
          <div className="py-6 sm:py-12 flex-grow flex flex-col">
            <Container>
              <Switch>
                <Route path="/faq">
                  <Faq />
                </Route>
                <Route exact path="/">
                  <ConnectMetamask />
                </Route>
                <Route path="/staking">
                  <ConnectMetamask />
                </Route>
              </Switch>
            </Container>
          </div>
        </Router>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col">
      <Router>
        <Header />
        <div className="py-6 sm:py-12 flex-grow flex flex-col">
          <Container>
            <Switch>
              <Route path="/faq">
                <Faq />
              </Route>
              <Route exact path="/">
                <BettingProvider>
                  <Dashboard />
                </BettingProvider>
              </Route>
              <Route path="/staking">
                <StakingProvider>
                  <Staking />
                </StakingProvider>
              </Route>
            </Switch>
          </Container>
        </div>
      </Router>
    </div>
  );
};

const ConnectedRoutesComponent = RoutesComponent;

export const App = (props) => {
  return (
    <ConnectedRoutesComponent />
  );
};

export default App;
