module.exports = {
  port: process.env.PORT || 5000,
  dbURL: process.env.MONGODB_URI,
  database: "pricedb",
  collection: "BNBUSD",
  currencyResultLimit: 2000,
  CURRENCY_FEED_URL: process.env.CURRENCY_FEED_URL,
  CURRENCY_FEED_CONTRACT_ADDRESS: process.env.CURRENCY_FEED_CONTRACT_ADDRESS,
  INTERVAL: process.env.CURRENCY_FEED_INTERVAL //milliseconds
};
