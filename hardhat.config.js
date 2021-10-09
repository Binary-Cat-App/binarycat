require("@nomiclabs/hardhat-waffle");
require('hardhat-deploy');
require("@nomiclabs/hardhat-ethers")
require("solidity-coverage");
require("hardhat-gas-reporter");
require('./tasks')

const fs = require('fs');
const mnemonic = fs.readFileSync(".mnemonic").toString().trim();

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.0",
            },
            {
                version: "0.8.8",
            }
        ]
    },
  namedAccounts: {
    deployer: 0,
  },

  networks: {
      hardhat: {
          gasPrice: 0,
          initialBaseFeePerGas: 0,
      },
      matic_testnet: {
        url: "https://matic-mumbai.chainstacklabs.com",
        chainId: 80001,
        accounts: mnemonic ? { mnemonic } : undefined,
        gasPrice: 8000000000,
    }
  },

};


