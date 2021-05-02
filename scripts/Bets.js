const Bin = artifacts.require('./BinaryBet.sol')

async function bet(contract) {
    const accounts = await web3.eth.getAccounts()

    await contract.placeBet("1000000000000000000", 0, {from: accounts[3], value: 1000000000000000000})
    await contract.placeBet("2000000000000000000", 0, {from: accounts[4], value: 2000000000000000000})
    await contract.placeBet("2500000000000000000", 1, {from: accounts[5], value: 2500000000000000000})
    await contract.placeBet("23000000000000000000", 0, {from: accounts[6], value: 23000000000000000000})
    await contract.placeBet("5000000000000000000", 1, {from: accounts[7], value: 5000000000000000000})
    await contract.placeBet("4000000000000000000", 0, {from: accounts[8], value: 4000000000000000000})
    await contract.placeBet("32000000000000000000", 1, {from: accounts[9], value: 32000000000000000000})
    await contract.placeBet("2000000000000000000", 1, {from: accounts[2], value: 2000000000000000000})
}

module.exports = function(done) {
    Bin.deployed().then(function(contract) {
        return bet(contract)
    })
    .then(()=> {console.log("Done!"); return done()}, (reason) => {console.log("Error:", reason); return done()});
};
