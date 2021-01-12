const BinBet = artifacts.require("BinaryBet");

module.exports = function (deployer) {
  deployer.deploy(BinBet, 10, 20, 5);
};
