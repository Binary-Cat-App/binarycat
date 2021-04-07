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

#### Local Demo:
* To add batch of deposits
> npx truffle exec ./scripts/Deposits.js
* To add a batch of bets
> npx truffle exec ./scripts/Bets.js
* To add individual deposits, withdraw and bets:
> npx truffle exec ./scripts/new_deposit.js <account number (int)> <value (uint)>

> npx truffle exec ./scripts/new_withdraw.js <account number (int)> <value (uint)>

> npx truffle exec ./scripts/new_bet.js <account number (int)> <value of bet (uint)> <value sent with tx (uint)> <bet side (0 or 1)>

Changes should be reflected on Ganache GUI:
* Add link to truffle-config.js to 'settings/workspace' so Ganache can get detailed information from the contract.
* Select automine = off in 'settings/server' if you want the blockchain to be incremented automatically (new block every x seconds)

#### BSC Testnet
* Already deployed, addresses available at './artifacts'
* To redeploy, $ npx truffle migrate --network testnet
