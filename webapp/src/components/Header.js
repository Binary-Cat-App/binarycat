import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from './Container';
import { ReactComponent as Logo } from '../assets/images/logo.svg';
import { ReactComponent as IconSupport } from '../assets/images/icon-support.svg';
import { ReactComponent as IconHelp } from '../assets/images/icon-help.svg';

export const Header = () => {
  return (
    <div className="pt-8 flex-shrink-0">
      <Container>
        <div className="flex items-center justify-between">
          <span className="mr-4">
            <Link to="/">
              <Logo />
            </Link>
          </span>
          <div>
            <ul className="flex items-center text-sm">
              <li className="mr-4">
                <Link
                  to="/faq"
                  className="text-gray-500 hover:text-gray-800 flex items-center"
                >
                  <IconHelp className="icon mr-2" />
                  Faq
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-gray-500 hover:text-gray-800 flex items-center"
                >
                  <IconSupport className="icon mr-2" />
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
};
