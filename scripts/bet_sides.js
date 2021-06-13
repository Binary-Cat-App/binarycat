const Bin = artifacts.require('./BinaryBet.sol')
const BN = require('bn.js');

async function deployAll(contract) {
    let duration = await contract.windowDuration()
    let firstBlock = await contract.firstBlock()
    let firstWindow = await contract.firstWindow()
    let offset = await contract.windowOffset()
    let block = await web3.eth.getBlock("latest")
    let blockNumber = block.number
    let windowNumber = await contract.getWindowNumber(blockNumber, duration, firstBlock, offset, firstWindow);

    let val = "10000000000000000"

    let price = await contract.windowPrice(windowNumber)
    if (price == 0) {
        await contract.placeBet(val, 0)
        await contract.placeBet(val, 1)
        console.log('bets placed')
    }
    else {
        console.log('already updated')
    }
}

module.exports = function(done) {
    Bin.deployed().then(function(contract) {
        return deployAll(contract)
    })
    .then(()=> {console.log("Done!"); return done()}, (reason) => {console.log("Error:", reason); return done()});
};
