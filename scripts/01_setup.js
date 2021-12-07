const hre = require('hardhat');
const {deployments, getNamedAccounts, ethers} = hre;
/*
 Execute setup operations after deployment:
 Transfer owner funds (the part that do not go to the launchpad)
 to the Time-Lock contract.
 */

async function main() {
    const {deployer} = await getNamedAccounts();
    const [signer] = await ethers.getSigners();

    deployedContracts = await deployments.all()
    BinToken = deployedContracts['BinToken']
    TimeLock = deployedContracts['KittyTimeLock']

    const token = await hre.ethers.getContractAt(BinToken.abi, BinToken.address);

    const balance = await token.balanceOf(signer.address)
    await token.connect(signer).transfer(TimeLock.address, balance)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
