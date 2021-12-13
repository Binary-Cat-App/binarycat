module.exports = {
  hardhat: {
      price_feed_address: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
      window_duration: 300, //5 minutes * 60 seconds/minute
      fee: 2,
      reward: 332,
      ido_address: "0x67eAE479A44f24A1472b14171b006d84d2F00B60", //PLACE HOLDER
      release_timestamp: 16389876680,
      beneficiary: "0x152B849943a70ffdDf44b6ceFC871EF0aAdfb2cb"
  },

  avax_fuji: {
      price_feed_address: "0x5498BB86BC934c8D34FDA08E81D444153d0D06aD", // AVAX/USD price feed
      window_duration: 300,//5 minutes * 60 seconds/minute
      fee: 2,
      reward: 332,
      ido_address: "0x67eAE479A44f24A1472b14171b006d84d2F00B60", //PLACE HOLDER
      release_timestamp: 1638994964,
      beneficiary: "0x152B849943a70ffdDf44b6ceFC871EF0aAdfb2cb"

  },

  avax_mainnet: {
      price_feed_address: "0x0A77230d17318075983913bC2145DB16C7366156", // AVAX/USD price feed
      window_duration: 300,//5 minutes * 60 seconds/minute
      fee: 2,
      reward: 190,
      ido_address: "0xA6a30EdAa5dFb0b4c11a82c56Fd68bA36Cf8992e",
      release_timestamp: 1640998801, 
      beneficiary: "0xfbF8a1D6d712E8A4257C907e027d2B2A881e5cC5"
  },

}
