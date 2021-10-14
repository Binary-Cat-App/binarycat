import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useWeb3React } from "@web3-react/core";

import BinaryStaking from '../contracts/BinaryStaking.json';
import BinToken from '../contracts/BinToken.json';

const staking = BinaryStaking;
const token = BinToken;

const StakingContext = createContext();

export const useStaking = () => {
  return useContext(StakingContext);
};

export const StakingProvider = ({ children }) => {

  const { active, account, library } = useWeb3React();

  const web3Eth = library.eth;
  const web3Utils = library.utils;

  const stakingObj = new web3Eth.Contract(
    staking.abi,
    staking.address
  );

  const tokenObj = new web3Eth.Contract(
    token.abi,
    token.address
  );

  const [currentBlock, setCurrentBlock] = useState(null);
  const [totalStaked, setTotalStaked] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [stakedBalance, setStakedBalance] = useState(0);
  const [userAllowance, setUserAllowance] = useState(0);

  // Gets Current Blockchain Block
  useEffect(() => {
    if ( active && account ) {

      web3Eth
        .getBlock('latest')
        .then(
          (data) => {
            setCurrentBlock({ number: data.number, hash: data.hash });
          }
        );
      
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
  }, []);

  // Totals
  useEffect(() => {
    if ( active && account ) {

      // Total Staked
      tokenObj.methods
        .balanceOf(staking.address)
        .call({
          from: account
        })
        .then(
          (response) => setTotalStaked(response)
        );
      
      // Wallet Balance
      tokenObj.methods
        .balanceOf(account)
        .call({
          from: account
        })
        .then(
          (response) => setWalletBalance(response)
        );

      // Total Rewards
      stakingObj.methods
        .ownedDividends(account)
        .call({
          from: account
        })
        .then(
          (response) => setTotalRewards(response)
        );

      // Staked Balance
      stakingObj.methods
        .stakingBalance(account)
        .call({
          from: account
        })
        .then(
          (response) => setStakedBalance(response.stakedBin)
        );

      // User Allowance
      tokenObj.methods
        .allowance(account, staking.address)
        .call({
          from: account
        })
        .then(
          (response) => setUserAllowance(response)
        );

    }
  }, [currentBlock]);


  const weiToCurrency = (value, asFloat = true) => {
    if (!value) return;
    const valueInCurrency = web3Utils.fromWei(value, global.config.currencyRequestValue);
    return (asFloat) ? parseFloat(valueInCurrency) : valueInCurrency;
  };

  const currencyToWei = (value, asBigInt = false) => {
    if (!value) return;
    const valueInWei = web3Utils.toWei(value.toString(), global.config.currencyRequestValue);
    return (asBigInt) ? BigInt(valueInWei) : valueInWei;
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
    stakingObj,
    staking,
    tokenObj
  };

  return (
    <StakingContext.Provider value={value}>{children}</StakingContext.Provider>
  );
};
