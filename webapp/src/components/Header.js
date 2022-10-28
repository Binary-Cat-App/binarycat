import React, { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Container } from './Container';
import { ReactComponent as Logo } from '../assets/images/logo.svg';
import LogoOp from '../assets/images/logo4.png';
import { ReactComponent as IconHelp } from '../assets/images/icon-help.svg';
import { ReactComponent as IconAdd } from '../assets/images/icon-add.svg';
import { ControlBar } from './ControlBar';
import { CURRENCY_ETH } from '../context/BettingContext';

export const Header = ({ connected = false, selectedCurrency }) => {
  const location = useLocation();
  const { active, account } = useWeb3React();
  const ethereum = window.ethereum;

  const [success, setSuccess] = useState(false);

  const tokenAddress =
    selectedCurrency === CURRENCY_ETH
      ? '0x165DBb08de0476271714952C3C1F068693bd60D7'
      : '0xbca7f1998dc9ffb70b086543a808960a460abca7';
  const token = {
    address: tokenAddress,
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
            {location.pathname !== '/flippening/staking' &&
              location.pathname !== '/flippening' && (
                <Link to="/">
                  <Logo />
                </Link>
              )}

            {location.pathname === '/flippening' && (
              <Link to="/flippening">
                <img src={LogoOp} width="220.0" />
              </Link>
            )}

            {location.pathname === '/flippening/staking' && (
              <Link to="/flippening">
                <img src={LogoOp} width="220.0" />
              </Link>
            )}
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
                <a
                  href="https://landing.binarycat.app/help"
                  className="text-gray-500 hover:text-gray-800 flex items-center"
                  target="_blank"
                >
                  <IconHelp className="icon mr-2" />
                  Help
                </a>
              </li>
              <li>
                {location.pathname === '/staking' && (
                  <Link to="/" className={`btn btn--outline`}>
                    Bet
                  </Link>
                )}
                {location.pathname === '/flippening/staking' && (
                  <Link to="/flippening" className={`btn btn--outline`}>
                    Bet
                  </Link>
                )}
                {location.pathname === '/flippening' && (
                  <Link to="/flippening/staking" className={`btn btn--outline`}>
                    Staking
                  </Link>
                )}
                {!location.pathname.includes('flippening') &&
                  !location.pathname.includes('staking') && (
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
