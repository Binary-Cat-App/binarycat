import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from './Container';

export const Header = () => {
  return (
    <div className="bg-white py-4 flex-shrink-0">
      <Container>
        <div className="flex items-center justify-between">
          <span className="mr-4">
            <Link to="/">
              <img src="https://via.placeholder.com/180x42" alt="" />
            </Link>
          </span>
          <div>
            <ul className="flex items-center text-sm">
              <li className="mr-4">
                <Link to="/faq" className="text-gray-500 hover:text-gray-800">
                  Faq
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-gray-500 hover:text-gray-800"
                >
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
