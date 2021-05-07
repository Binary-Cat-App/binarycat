module.exports = {
  port: process.env.PORT || 5000,
  db: process.env.MONGODB_URI,
  PAIR: "BNB/USD",
  INTERVAL: 10000 //milliseconds
};
