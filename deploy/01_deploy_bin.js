const config = require('../deploy_config.js')
module.exports = async ({getNamedAccounts, deployments, network}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();

    const IDO_ADDRESS = config[network.name].ido_address
    const RELEASE_TIMESTAMP = config[network.name].release_timestamp
    let PRICE_FEED_ADDRESS = config[network.name].price_feed_address
    const WINDOW_DURATION = config[network.name].window_duration;
    const FEE = config[network.name].fee;
    const REWARD = config[network.name].reward;

    if (network.name === 'hardhat' || network.name === 'localhost') {
        let mock = await deploy('OracleMock', {
            from: deployer,
            args: [],
            log: true,
        });
        PRICE_FEED_ADDRESS = mock.address
    }


    console.log(IDO_ADDRESS)
    let token = await deploy('BinToken', {
    from: deployer,
    args: [IDO_ADDRESS],
    log: true,
    });

    let lock = await deploy('KittyTimeLock', {
        from: deployer,
        args: [token.address, deployer, RELEASE_TIMESTAMP],
        log: true,
    });

    let stake = await deploy('BinaryStaking', {
        from: deployer,
        args: [token.address],
        log: true,
    });

    let bet = await deploy('BinaryBet', {
        from: deployer,
        args: [WINDOW_DURATION, FEE, PRICE_FEED_ADDRESS, stake.address, token.address, REWARD],
        log: true,
    });
}

module.exports.tags = ['BinaryStaking', 'BinaryBet', 'BinToken', 'KittyTimeLock'];
