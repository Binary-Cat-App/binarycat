import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { useWeb3React } from '@web3-react/core';

import AvaxBinaryStaking from '../contracts/avax/BinaryStaking.json';
import AvaxBinToken from '../contracts/avax/BinToken.json';
import EthBinaryStaking from '../contracts/eth/BinaryStaking.json';
import EthBinToken from '../contracts/eth/BinToken.json';
import Networks from '../networks.json';

import { CURRENCY_ETH, CURRENCY_AVAX, CURRENCY_KITTY } from './BettingContext';

const StakingContext = createContext();

export const useStaking = () => {
  return useContext(StakingContext);
};

export const StakingProvider = ({ children, currency }) => {
  const { active, account, library } = useWeb3React();

  const web3Eth = library.eth;
  const web3Utils = library.utils;

  const staking =
    currency === CURRENCY_ETH ? EthBinaryStaking : AvaxBinaryStaking;
  const token = currency === CURRENCY_ETH ? EthBinToken : AvaxBinToken;

  const stakingContract = new web3Eth.Contract(staking.abi, staking.address);
  const tokenContract = new web3Eth.Contract(token.abi, token.address);

  const [currentBlock, setCurrentBlock] = useState(null);
  const [totalStaked, setTotalStaked] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [stakedBalance, setStakedBalance] = useState(0);
  const [userAllowance, setUserAllowance] = useState(0);

  // INIT
  useEffect(() => {
    console.log('Staking...');
    checkNetwork();
    getCurrentBlock();
  }, []);

  // Gets Current Blockchain Block
  const getCurrentBlock = async () => {
    if (active && account) {
      web3Eth.getBlock('latest').then((data) => {
        setCurrentBlock({ number: data.number, hash: data.hash });
      });

      var subscription = web3Eth
        .subscribe('newBlockHeaders')
        .on('connected', function (subscriptionId) {
          //console.log(subscriptionId);
        })
        .on('data', function (blockHeader) {
          setCurrentBlock({
            number: blockHeader.number,
            hash: blockHeader.hash,
            timestamp: blockHeader.timestamp,
          });
        })
        .on('error', console.error);

      // unsubscribes the subscription
      return () => {
        subscription.unsubscribe(function (error, success) {
          if (success) {
            console.log('Successfully unsubscribed!');
          }
        });
      };
    }
  };

  useEffect(() => {
    getCurrentBlock();
  }, [account]);

  const checkNetwork = async () => {
    if (!currency) {
      currency = CURRENCY_AVAX;
    }
    let chainId = await web3Eth.net.getId();
    if (!currency) {
      return;
    }
    if (currency === CURRENCY_ETH && chainId != Networks['eth'].chainId) {
      changeNetwork();
    } else if (
      (currency === CURRENCY_AVAX || currency === CURRENCY_KITTY) &&
      chainId != Networks['avax'].chainId
    ) {
      changeNetwork();
    }
  };

  const changeNetwork = async () => {
    let network = Networks[currency.toLowerCase()];
    let chainId = network.chainId;
    let chainName = network.chainName;
    let rpcURL = network.rpcUrl;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: web3Utils.toHex(chainId) }],
      });
      window.location.reload(false);
    } catch (err) {
      // This error code indicates that the chain has not been added to MetaMask
      if (err.code === 4902) {
        await web3Eth.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainName: chainName,
              chainId: web3Utils.toHex(chainId),
              nativeCurrency: currency,
              rpcUrls: [rpcURL],
            },
          ],
        });
      }
    }
  };

  // Totals
  useEffect(() => {
    if (active && account) {
      // Total Staked
      stakingContract.methods
        .totalSupply()
        .call({
          from: account,
        })
        .then((response) => setTotalStaked(response));

      // Wallet Balance
      stakingContract.methods
        .balanceOf(account)
        .call({
          from: account,
        })
        .then((response) => setWalletBalance(response));

      // Total Rewards
      stakingContract.methods
        .ownedDividends(account)
        .call({
          from: account,
        })
        .then((response) => setTotalRewards(response));

      // Staked Balance
      stakingContract.methods
        .balanceOf(account)
        .call({
          from: account,
        })
        .then((response) => setStakedBalance(response));

      // User Allowance
      tokenContract.methods
        .allowance(account, staking.address)
        .call({
          from: account,
        })
        .then((response) => setUserAllowance(response));
    }
  }, [currentBlock]);

  const weiToCurrency = (value, asFloat = true) => {
    if (!value) return;
    const valueInCurrency = web3Utils.fromWei(
      value,
      global.config.currencyRequestValue
    );
    return asFloat ? parseFloat(valueInCurrency) : valueInCurrency;
  };

  const currencyToWei = (value, asBigInt = false) => {
    if (!value) return;
    const valueInWei = web3Utils.toWei(
      value.toString(),
      global.config.currencyRequestValue
    );
    return asBigInt ? BigInt(valueInWei) : valueInWei;
  };

  const value = {
    active,
    account,
    totalStaked,
    totalRewards,
    walletBalance,
    stakedBalance,
    userAllowance,
    weiToCurrency,
    currencyToWei,
    web3Eth,
    web3Utils,
    stakingContract,
    staking,
    tokenContract,
    currency,
  };

  return (
    <StakingContext.Provider value={value}>{children}</StakingContext.Provider>
  );
};
