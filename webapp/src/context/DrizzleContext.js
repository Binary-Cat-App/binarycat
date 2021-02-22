import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMetaMask } from '../context/MataMaskContext';

const DrizzleContext = createContext();

export const useDrizzle = () => {
  return useContext(DrizzleContext);
};

export const DrizzleProvider = ({ drizzle, children }) => {
  const [drizzleReadinessState, setDrizzleReadinessState] = useState({
    drizzleState: null,
    loading: true,
  });
  const [balance, setBalance] = useState(0);
  const [balKey, setBalKey] = useState(null);
  const { ethAccount } = useMetaMask();

  const [currentBlock, setCurrentBlock] = useState(null);

  useEffect(() => {
    if (
      drizzleReadinessState.loading === false &&
      drizzleReadinessState.drizzleState.contracts.BinaryBet.getBalance
    ) {
      const contract = drizzle.contracts.BinaryBet;
      const balKey = contract.methods['getBalance'].cacheCall(ethAccount);
      const bal =
        drizzleReadinessState.drizzleState.contracts.BinaryBet.getBalance[
          balKey
        ];
      if (bal) {
        if (bal.value) {
          const ethBal =
            Math.round(
              drizzle.web3.utils.fromWei(
                bal.value,
                global.config.currencyRequestValue
              ) * 100
            ) / 100;
          setBalance(ethBal);
          console.log('CHANGE BALANCE', ethBal);
        }
      }
    }
  }, [
    drizzleReadinessState.loading,
    drizzle.web3,
    drizzleReadinessState.drizzleState,
  ]);

  useEffect(() => {
    const unsubscribe = drizzle.store.subscribe(() => {
      // every time the store updates, grab the state from drizzle
      const drizzleState = drizzle.store.getState();
      // check to see if it's ready, if so, update local component state
      if (drizzleState.drizzleStatus.initialized) {
        setDrizzleReadinessState({
          drizzleState: drizzleState,
          loading: false,
        });
      }
    });
    return () => {
      unsubscribe();
    };
  }, [drizzle.store, drizzleReadinessState]);

  useEffect(() => {
    if (drizzleReadinessState.loading === false) {
      const contract = drizzle.contracts.BinaryBet;
      const web3 = drizzle.web3;
      const yourContractWeb3 = new web3.eth.Contract(
        contract.abi,
        contract.address
      );
      // setInterval(() => {
      //   yourContractWeb3.getPastEvents('allEvents', {}).then((data) => {
      //     console.log('\n\n----\ngetPastEvents:::', data, '\n\n----\n\n');
      //   });
      // }, 3000);
    }
  }, [drizzleReadinessState.loading, drizzle.web3]);

  useEffect(() => {
    if (drizzleReadinessState.loading === false) {
      drizzle.web3.eth.getBlock('latest').then((data) => {
        setCurrentBlock({ number: data.number, hash: data.hash });
      });
      var subscription = drizzle.web3.eth
        .subscribe('newBlockHeaders')
        .on('connected', function (subscriptionId) {
          console.log(subscriptionId);
        })
        .on('data', function (blockHeader) {
          setCurrentBlock({
            number: blockHeader.number,
            hash: blockHeader.hash,
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
  }, [drizzleReadinessState.loading]);

  const value = {
    drizzle,
    drizzleReadinessState,
    currentBlock,
    balance,
  };

  return (
    <DrizzleContext.Provider value={value}>{children}</DrizzleContext.Provider>
  );
};
