
async function main() {
    const PRICE_FEED_ADDRESS = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"
    const WINDOW_DURATION = 120;
    const FEE = 2;
    const TRANSFER_AMOUNT = 5e25; //50 MIL * 10**18???

    const BinTokenFactory = await ethers.getContractFactory("BinToken");
    const BinaryStakingFactory = await ethers.getContractFactory("BinaryStaking");
    const BinBetFactory = await ethers.getContractFactory("BinaryBet");
    
    const token = await BinTokenFactory.deploy();
    const staking = await BinaryStakingFactory.deploy(token.address);
    const binbet = await BinBetFactory.deploy(WINDOW_DURATION, FEE, PRICE_FEED_ADDRESS);

    let tx_setStaking = await binbet.setStakingAddress(staking.address);
    let tx_setToken = await binbet.setTokenAddress(token.address);
    
    let tx_transfer = await token.transfer(binbet.address, BigInt(TRANSFER_AMOUNT).toString());
    

    console.log(staking.address)
    console.log(binbet.address)
    console.log(token.address);

    console.log(tx_setStaking);
    console.log(tx_setToken);
    console.log(tx_transfer);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

//module.exports = async ({getNamedAccounts, deployments}) => {
//  const {deploy} = deployments;
//  const {deployer} = await getNamedAccounts();
//    console.log(" wtf 1");
//
//     const PRICE_FEED_ADDRESS = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"
//    const WINDOW_DURATION = 120;
//    const FEE = 2;
//    const TRANSFER_AMOUNT = 5e25; //50 MIL * 10**18???
//
//    let token = await deploy('BinToken', {
//    from: deployer,
//    args: [],
//    log: true,
//  });
//    console.log(" wtf 2");
//
//    let stake = await deploy('BinaryStaking', {
//        from: deployer,
//        args: [token.address],
//        log: true,
//    });
//
//    let bet = await deploy('BinBet', {
//        from: deployer,
//        args: [WINDOW_DURATION, FEE, PRICE_FEED_ADDRESS],
//        log: true,
//    });
//
//    let tx_setStaking = await bet.setStakingAddress(stake.address);
//    let tx_setToken = await bet.setTokenAddress(token.address);
//
//    let tx_transfer = await token.transfer(bet.address, TRANSFER_AMOUNT.toString());
//
//    console.log(tx_setStaking);
//   console.log(tx_setToken);
//    console.log(tx_transfer);
//
//
//
//};
//module.exports.tags = ['BinaryStaking', 'BinBet', 'BinToken'];
