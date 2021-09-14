import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from './Container';
import { ReactComponent as Logo } from '../assets/images/logo.svg';
import { ReactComponent as IconSupport } from '../assets/images/icon-support.svg';
import { ReactComponent as IconHelp } from '../assets/images/icon-help.svg';
import { ReactComponent as IconTwitter } from '../assets/images/icon-twitter.svg';
import { ReactComponent as IconReddit } from '../assets/images/icon-reddit.svg';
import { ReactComponent as IconMedium } from '../assets/images/icon-medium.svg';

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
              <li className="mr-4">
                <a 
                  href="https://t.me/BinaryCatChat"
                  className="text-gray-500 hover:text-gray-800 flex items-center"
                  target="_blank"
                >
                  <IconSupport className="icon mr-2" />
                  Support
                </a>
              </li>
              <li className="mr-4">
                <a 
                  href="https://twitter.com/BinaryCatApp"
                  className="text-gray-500 hover:text-gray-800 flex items-center"
                  target="_blank"
                >
                  <IconTwitter className="icon mr-2" />
                  Twitter
                </a>
              </li>
              <li className="mr-4">
                <a 
                  href="https://www.reddit.com/user/BinaryCatApp"
                  className="text-gray-500 hover:text-gray-800 flex items-center"
                  target="_blank"
                >
                  <IconReddit className="icon mr-2" />
                  Reddit
                </a>
              </li>
              <li>
                <a 
                  href="https://medium.com/@BinaryCat"
                  className="text-gray-500 hover:text-gray-800 flex items-center"
                  target="_blank"
                >
                  <IconMedium className="icon mr-2" />
                  Medium
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
};
