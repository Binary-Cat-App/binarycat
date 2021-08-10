const BinBet = artifacts.require("BinaryBet");
const BinToken = artifacts.require("BinToken");
const BinStake = artifacts.require("BinaryStaking");

module.exports = async deployer => {
  await deployer.deploy(BinToken);
  token = await BinToken.deployed();

  await deployer.deploy(BinStake, token.address);
  stake = await BinStake.deployed();

  await deployer.deploy(BinBet, 120, 2, "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526");
  bet = await BinBet.deployed();
  await bet.setStakingAddress(stake.address);
  await bet.setTokenAddress(token.address);
  let supply = await token.INITIAL_SUPPLY();
  token.transfer(bet.address, BigInt(supply).toString())
  bal = await token.balanceOf(bet.address);
  console.log(bal.toString())
};
