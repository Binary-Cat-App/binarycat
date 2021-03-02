import React, { createContext, useContext, useState } from 'react';

const MetaMaskContext = createContext();

export const useMetaMask = () => {
  return useContext(MetaMaskContext);
};

export const MetaMaskProvider = ({ children }) => {
  const [ethAccount, setEthAccount] = useState('');
  const [balance, setBalance] = useState(0);

  React.useEffect(() => {
    window.ethereum
      .request({ method: 'eth_accounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.warn('Please connect to MetaMask.');
          setEthAccount('');
        } else {
          console.error(err);
          setEthAccount('');
        }
      });
  }, []);

  React.useEffect(() => {
    if (ethAccount !== '') {
      window.ethereum
        .request({ method: 'eth_getBalance', params: [ethAccount, 'latest'] })
        .then((data) => {
          const b = parseInt(data, 16);
          const ethBal = b * Math.pow(10, -18);
          setBalance(ethBal);
        });
    }
  }, [ethAccount]);

  // window.ethereum.on('accountsChanged', (accounts) => {
  //   console.log('ACCOUNTS', accounts);
  //   // Handle the new accounts, or lack thereof.
  //   // "accounts" will always be an array, but it can be empty.
  // });

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.warn('MetaMask account is not connected');
    } else if (accounts[0] !== ethAccount) {
      setEthAccount(accounts[0]);
      // Do any other work!
    }
  };

  async function connectMataMask() {
    window.ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.warn('Please connect to MetaMask.');
          setEthAccount('');
        } else {
          console.error(err);
          setEthAccount('');
        }
      });
  }

  const value = {
    ethAccount,
    connectMataMask,
    balance,
  };

  return (
    <MetaMaskContext.Provider value={value}>
      {children}
    </MetaMaskContext.Provider>
  );
};
