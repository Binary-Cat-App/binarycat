import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Header } from './Header';
import { Support } from './Support';
import { Faq } from './Faq';
import { Dashboard } from './Dashboard';
import { Container } from './Container';
import { AuthProvider } from '../context/AuthContext';

export const App = () => {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
};

export default App;
