import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from './Container';
import { ReactComponent as IconTwitter } from '../assets/images/icon-twitter.svg';
import { ReactComponent as IconReddit } from '../assets/images/icon-reddit.svg';
import { ReactComponent as IconMedium } from '../assets/images/icon-medium.svg';

export const Footer = () => {
  return (
    <div className="py-8 flex-shrink-0">
      <Container>
        <div className="flex justify-center">
          <ul className="flex items-center text-sm">
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
                href="https://www.reddit.com/r/BinaryCat/"
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
      </Container>
    </div>
  );
};
