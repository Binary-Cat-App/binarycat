const Bin = artifacts.require('./BinaryBet.sol')
const BN = require('bn.js');

async function deployAll(contract) {
    const duration = await contract.windowDuration()
    const firstBlock = await contract.firstBlock()
    const firstWindow = await contract.firstWindow()
    const offset = await contract.windowOffset()
    let block = await web3.eth.getBlock("latest")
    const blockNumber = block.number
    const windowNumber = await contract.getWindowNumber(blockNumber, duration, firstBlock, offset, firstWindow);

    const price = await contract.windowPrice(windowNumber)
    if (price == 0) {
        await contract.updatePrice()
        console.log('price updated')
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
