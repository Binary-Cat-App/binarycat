module.exports = {
  port: process.env.PORT || 5000,
  db: process.env.MONGODB_URI,
  PAIR: "BNB/USD",
  INTERVAL: process.env.CURRENCY_FEED_INTERVAL //milliseconds
};
