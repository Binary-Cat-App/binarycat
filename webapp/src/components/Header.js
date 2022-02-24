import React, { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Container } from './Container';
import { ReactComponent as Logo } from '../assets/images/logo.svg';
import { ReactComponent as IconHelp } from '../assets/images/icon-help.svg';
import { ReactComponent as IconAdd } from '../assets/images/icon-add.svg';
import { ControlBar } from './ControlBar';

export const Header = ({ connected = false }) => {
  const location = useLocation();
  const { active, account } = useWeb3React();
  const ethereum = window.ethereum;

  const [success, setSuccess] = useState(false);

  const token = {
    address: '0xbca7f1998dc9ffb70b086543a808960a460abca7',
    symbol: 'KITTY',
    decimals: 18,
  };

  const handleAddToken = async () => {
    if (active && account) {
      ethereum
        .request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: token.address,
              symbol: token.symbol,
              decimals: token.decimals,
            },
          },
        })
        .then((success) => {
          setSuccess(success);
        })
        .catch(() => setSuccess(false));
    }
  };

  return (
    <div className="pt-4 lg:pt-8 flex-shrink-0">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between">
          <span className="mb-4 md:mb-0 md:mr-4">
            <Link to="/">
              <Logo />
            </Link>
          </span>
          <div>
            <ul className="flex items-center text-sm">
              {connected && (
                <li className="mr-4">
                  <Link
                    to="#"
                    onClick={handleAddToken}
                    className="text-gray-500 hover:text-gray-800 flex items-center"
                  >
                    <IconAdd className="icon mr-2" />
                    Add KITTY token to MetaMask
                  </Link>
                </li>
              )}
              <li className="mr-4">
                <Link
                  to="/help"
                  className="text-gray-500 hover:text-gray-800 flex items-center"
                >
                  <IconHelp className="icon mr-2" />
                  Help
                </Link>
              </li>
              <li>
                {location.pathname === '/staking' && (
                  <Link to="/" className={`btn btn--outline`}>
                    Bet
                  </Link>
                )}

                {location.pathname === '/' && (
                  <Link to="/staking" className={`btn btn--outline`}>
                    Staking
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
};
