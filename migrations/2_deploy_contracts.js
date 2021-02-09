const BinBet = artifacts.require("BinaryBet");
const BinToken = artifacts.require("BinToken");
const BinStake = artifacts.require("BinaryStaking");

module.exports = function (deployer) {
  deployer.deploy(BinToken).then(function(){
      return deployer.deploy(BinStake, BinToken.address).then(function(){
            deployer.deploy(BinBet, 10, 20, 5).then(function(){
                BinBet.setStakingAddress(BinStake.address);
            });

      });
  });
};
