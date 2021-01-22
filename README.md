# BIN 
## Blockchain
### Requirements
* node 14.x
* [Truffle Ganache](https://trufflesuite.com/ganache)

### Setup
On project root folder:

$npm install


### Deploy Contracts (localy)
1) Open Truffle Ganache and create new workspace. Attach "truffle-config.js" in truffle projects section of the workspace creation wizard. Make sure the default accounts have initial balance, it will be requried for the contracts deployment.
2) $npx truffle compile
3) $npx truffle migrate --reset
4) $npx truffle deploys

Now contracts are deployed on Ganache simulated blockchain and contracts artifacts can be found in './build/contracts/'
