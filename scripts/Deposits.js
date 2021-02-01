const Bin = artifacts.require('./BinaryBet.sol')

async function deployAll(contract) {
    const accounts = await web3.eth.getAccounts()
    await contract.deposit({from: accounts[2],value: 100000000000000000})
    await contract.deposit({from: accounts[3],value: 100000000000000000})
    await contract.deposit({from: accounts[3],value: 100000000000000000})
    await contract.deposit({from: accounts[3],value: 100000000000000000})
    await contract.deposit({from: accounts[3],value: 100000000000000000})
    await contract.deposit({from: accounts[6],value: 100000000000000000})
    await contract.deposit({from: accounts[6],value: 100000000000000000})
}

module.exports = function(done) {
    Bin.deployed().then(function(contract) {
        return deployAll(contract)
    })
    .then(()=> {console.log("Done!"); return done()}, (reason) => {console.log("Error:", reason); return done()});
};
