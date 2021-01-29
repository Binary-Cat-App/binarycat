import React, { createContext, useContext, useState, useEffect } from 'react';

const DrizzleContext = createContext();

export const useDrizzle = () => {
  return useContext(DrizzleContext);
};

export const DrizzleProvider = ({ drizzle, children }) => {
  const [drizzleReadinessState, setDrizzleReadinessState] = useState({
    drizzleState: null,
    loading: true,
  });

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

  const value = {
    drizzle,
    drizzleReadinessState,
  };

  return (
    <DrizzleContext.Provider value={value}>{children}</DrizzleContext.Provider>
  );
};
