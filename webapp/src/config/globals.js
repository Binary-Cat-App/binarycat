module.exports = global.config = {
  currencyName: 'BNB',
  currencyRequestValue: 'ether',
  currencyRatesNodeAPI: (process.env.PORT) ? '' : 'http://localhost:5000'
};
