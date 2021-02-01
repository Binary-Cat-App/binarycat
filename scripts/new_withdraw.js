const Bin = artifacts.require('./BinaryBet.sol')

let args = process.argv.slice(2);
let val = args[3];
let account = args[2]
async function deployAll(contract) {
    const accounts = await web3.eth.getAccounts()
    await contract.withdraw(val, {from: accounts[account]})
}

module.exports = function(done) {
    Bin.deployed().then(function(contract) {
        return deployAll(contract)
    })
    .then(()=> {console.log("Done!"); return done()}, (reason) => {console.log("Error:", reason); return done()});
};
