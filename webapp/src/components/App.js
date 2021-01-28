import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Header } from './Header';
import { Support } from './Support';
import { Faq } from './Faq';
import Dashboard from './Dashboard';
import { Container } from './Container';
import { AuthProvider } from '../context/AuthContext';
import { MetaMaskProvider } from '../context/MataMaskContext';
import BinaryBet from '../contracts/BinaryBet.json';
import { DrizzleProvider } from 'drizzle-react';
import { LoadingContainer } from 'drizzle-react-components';
import { drizzleConnect } from 'drizzle-react';

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

const RoutesComponent = ({ initialized }) => {
  if (!initialized) return null;

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
              <Route path="/support">
                <Support />
              </Route>
              <Route exact path="/">
                <Dashboard />
              </Route>
            </Switch>
          </Container>
        </div>
      </Router>
    </div>
  );
};

const mapStateToProps = (store) => {
  return {
    initialized: store.drizzleStatus.initialized,
  };
};

const ConnectedRoutesComponent = drizzleConnect(
  RoutesComponent,
  mapStateToProps
);

export const App = () => {
  return (
    <DrizzleProvider options={options}>
      <AuthProvider>
        <MetaMaskProvider>
          <LoadingContainer>
            <ConnectedRoutesComponent />
          </LoadingContainer>
        </MetaMaskProvider>
      </AuthProvider>
    </DrizzleProvider>
  );
};

export default App;
