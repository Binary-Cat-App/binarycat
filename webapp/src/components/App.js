import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Header } from './Header';
import { Support } from './Support';
import { Faq } from './Faq';
import { NoMetamask } from './NoMetamask';
import { LoadingMetamask } from './LoadingMetamask';
import Dashboard from './Dashboard';
import { Container } from './Container';

import { DrizzleProvider, useDrizzle } from '../context/DrizzleContext';

const RoutesComponent = () => {
  const { drizzleReadinessState } = useDrizzle();
  
  if(!window.ethereum)
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
                  <NoMetamask />
                </Route>
              </Switch>
            </Container>
          </div>
        </Router>
      </div>
    );

  if (
    drizzleReadinessState.loading === true ||
    Object.keys(drizzleReadinessState.drizzleState.accounts).length === 0
  )
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
                  <LoadingMetamask />
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

const ConnectedRoutesComponent = RoutesComponent;

export const App = (props) => {
  return (
    <DrizzleProvider drizzle={props.drizzle}>
      <ConnectedRoutesComponent />
    </DrizzleProvider>
  );
};

export default App;
