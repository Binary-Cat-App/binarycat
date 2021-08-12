module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    let a =  await getNamedAccounts();

    const PRICE_FEED_ADDRESS = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"
    const WINDOW_DURATION = 120;
    const FEE = 2;

    let token = await deploy('BinToken', {
    from: deployer,
    args: [],
    log: true,
    });

    let stake = await deploy('BinaryStaking', {
        from: deployer,
        args: [token.address],
        log: true,
    });

    let bet = await deploy('BinaryBet', {
        from: deployer,
        args: [WINDOW_DURATION, FEE, PRICE_FEED_ADDRESS],
        log: true,
    });
}

module.exports.tags = ['BinaryStaking', 'BinaryBet', 'BinToken'];
