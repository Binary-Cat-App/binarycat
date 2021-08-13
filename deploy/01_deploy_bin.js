const config = require('../config.js')
module.exports = async ({getNamedAccounts, deployments, network}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();

    const PRICE_FEED_ADDRESS = config[network.name].price_feed_address
    const WINDOW_DURATION = config[network.name].window_duration;
    const FEE = config[network.name].fee;

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