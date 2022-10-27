const config = require('../deploy_config.js')
module.exports = async ({getNamedAccounts, deployments, network}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();

    const FEE = 2;
    const REWARD = 5000
    const BRIDGE_OPTIMISM_ADDRESS = "0x165DBb08de0476271714952C3C1F068693bd60D7"

    if (network.name === 'hardhat' || network.name === 'localhost') {
        let mock = await deploy('OracleMock', {
            from: deployer,
            args: [],
            log: true,
            skipIfAlreadyDeployed: true,
        });
        PRICE_FEED_ADDRESS = mock.address
    }


    let stake = await deploy('BinaryStaking', {
        from: deployer,
        args: [BRIDGE_OPTIMISM_ADDRESS],
        log: true,
        skipIfAlreadyDeployed: true,
    });

    let betLibrary = await deploy('BetLibrary', {
        from: deployer,
        log: true,
        skipIfAlreadyDeployed: true,
    });


    let flip = await deploy('Flip', {
        from: deployer,
        args: [86400, FEE, "0x13e3Ee699D1909E989722E753853AE30b17e08c5", "0xD702DD976Fb76Fffc2D3963D037dfDae5b04E593", stake.address, BRIDGE_OPTIMISM_ADDRESS, REWARD],
        libraries: {
            BetLibrary: betLibrary.address
        },
        log: true,
        skipIfAlreadyDeployed: true,
    });
}

module.exports.tags = ['BinaryStaking', 'Flip'];
