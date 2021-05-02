import BinaryBet from './contracts/BinaryBet.json';

const options = {
  contracts: [BinaryBet],
  events: {
    BinaryBet: ['newBet', 'newDeposit', 'newWithdraw', 'betSettled', 'priceUpdated'],
  },
  polls: {
    // set polling interval to 30secs so we don't get buried in poll events
    accounts: 30000,
  },
  web3: {
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:9545',
    },
  },
};

export default options;