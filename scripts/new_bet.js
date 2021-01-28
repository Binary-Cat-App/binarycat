const Bin = artifacts.require('./BinaryBet.sol')
const BN = require('bn.js');

let args = process.argv.slice(2);
let val = args[3];
let tx_val = args[4];
let account = args[2];
let side = args[5];
async function deployAll(contract) {
    const accounts = await web3.eth.getAccounts()
    await contract.placeBet(val,side, {from: accounts[account],value: tx_val})
}

module.exports = function(done) {
    Bin.deployed().then(function(contract) {
        return deployAll(contract)
    })
    .then(()=> {console.log("Done!"); return done()}, (reason) => {console.log("Error:", reason); return done()});
};
