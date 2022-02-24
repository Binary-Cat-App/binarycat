const config = require('../deploy_config.js')
module.exports = async ({getNamedAccounts, deployments, network}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();

    const IDO_ADDRESS = config[network.name].ido_address
    const BENEFICIARY = config[network.name].beneficiary
    const RELEASE_TIMESTAMP = config[network.name].release_timestamp
    let PRICE_FEED_ADDRESS = config[network.name].price_feed_address
    const WINDOW_DURATION = config[network.name].window_duration;
    const FEE = config[network.name].fee;
    const REWARD = config[network.name].reward;

    const MAX_BURN = config[network.name].max_burn;
    const BURN_ADDRESS = config[network.name].burn_address;


    if (network.name === 'hardhat' || network.name === 'localhost') {
        let mock = await deploy('OracleMock', {
            from: deployer,
            args: [],
            log: true,
            skipIfAlreadyDeployed: true,
        });
        PRICE_FEED_ADDRESS = mock.address
    }

    let token = await deploy('BinToken', {
        from: deployer,
        args: [IDO_ADDRESS],
        log: true,
        skipIfAlreadyDeployed: true,
    });

    let lock = await deploy('KittyTimeLock', {
        from: deployer,
        args: [token.address, BENEFICIARY, RELEASE_TIMESTAMP],
        log: true,
        skipIfAlreadyDeployed: true,
    });

    let stake = await deploy('BinaryStaking', {
        from: deployer,
        args: [token.address],
        log: true,
        skipIfAlreadyDeployed: true,
    });

    let bet = await deploy('BinaryBet', {
        from: deployer,
        args: [WINDOW_DURATION, FEE, PRICE_FEED_ADDRESS, stake.address, token.address, REWARD],
        log: true,
        skipIfAlreadyDeployed: true,
    });

    let betLibrary = await deploy('BetLibrary', {
        from: deployer,
        log: true,
    });

    let kittyPool = await deploy('KittyPool', {
        from: deployer,
        args: [FEE, MAX_BURN, token.address, bet.address, BURN_ADDRESS],
        libraries: {
            BetLibrary: betLibrary.address
        },
        log: true,
        skipIfAlreadyDeployed: true,
    });
}

module.exports.tags = ['BinaryStaking', 'BinaryBet', 'BinToken', 'KittyTimeLock', 'KittyPool'];
