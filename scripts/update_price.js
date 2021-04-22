const Bin = artifacts.require('./BinaryBet.sol')
const BN = require('bn.js');

async function deployAll(contract) {
    await contract.updatePrice()
}

module.exports = function(done) {
    Bin.deployed().then(function(contract) {
        return deployAll(contract)
    })
    .then(()=> {console.log("Done!"); return done()}, (reason) => {console.log("Error:", reason); return done()});
};
