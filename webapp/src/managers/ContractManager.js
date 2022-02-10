import { CURRENCY_AVAX, CURRENCY_KITTY } from '../context/BettingContext';

export default class ContractManager {
  static sharedInstance = null;

  /**
   * @returns {ContractManager}
   */
  static shared() {
    if (ContractManager.sharedInstance == null) {
      ContractManager.sharedInstance = new ContractManager();
    }
    return this.sharedInstance;
  }

  async getBets(contractObj, currency, windowNumber, account) {
    if (currency === CURRENCY_AVAX) {
      const result = await contractObj
        .getPastEvents('NewBet', {
          filter: { windowNumber: windowNumber },
          fromBlock: 0,
          toBlock: 'latest',
        })
        .then((result) => result);
      return result;
    } else if (currency === CURRENCY_KITTY) {
      // const betContract = await contractObj.
      console.log(contractObj);
      const result = await contractObj
        .getPastEvents('NewBet', {
          filter: { windowNumber: windowNumber },
          fromBlock: 0,
          toBlock: 'latest',
        })
        .then((result) => result);
      return result;
    }
  }

  async getPastEvents(contractObj, currency, windowNumber, event) {
    var prices;
    if (currency == CURRENCY_AVAX) {
      prices = await contractObj
        .getPastEvents(event, {
          filter: { windowNumber: [windowNumber + 1, windowNumber + 2] },
          fromBlock: 0,
          toBlock: 'latest',
        })
        .then((result) => result);
    }
    return prices;
  }
}
