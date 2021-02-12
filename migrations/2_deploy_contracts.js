const BinBet = artifacts.require("BinaryBet");
const BinToken = artifacts.require("BinToken");
const BinStake = artifacts.require("BinaryStaking");

module.exports = async (deployer) => {
    await deployer.deploy(BinToken);
    token = await BinToken.deployed();

    await deployer.deploy(BinStake, token.address);
    stake = await BinStake.deployed();

    await deployer.deploy(BinBet, 10, 20, 5);
    bet = await BinBet.deployed();
    await bet.setStakingAddress(stake.address);
};
