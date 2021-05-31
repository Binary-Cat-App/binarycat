# BIN

## Blockchain

### Requirements

- node 14.x
- [Truffle Ganache](https://trufflesuite.com/ganache)

### Setup

On project root folder:

\$npm install

### Deploy Contracts (localy)

1. Open Truffle Ganache and create new workspace. Attach "truffle-config.js" in truffle projects section of the workspace creation wizard. Make sure the default accounts have initial balance, it will be requried for the contracts deployment.
2. \$npx truffle compile
3. \$npx truffle migrate --reset
4. \$npx truffle deploys

Now contracts are deployed on Ganache simulated blockchain and contracts artifacts can be found in './build/contracts/'

#### Local Demo:

- To add batch of deposits
  > npx truffle exec ./scripts/Deposits.js
- To add a batch of bets
  > npx truffle exec ./scripts/Bets.js
- To add individual deposits, withdraw and bets:
  > npx truffle exec ./scripts/new_deposit.js <account number (int)> <value (uint)>

> npx truffle exec ./scripts/new_withdraw.js <account number (int)> <value (uint)>

> npx truffle exec ./scripts/new_bet.js <account number (int)> <value of bet (uint)> <value sent with tx (uint)> <bet side (0 or 1)>

Changes should be reflected on Ganache GUI:
- Add link to truffle-config.js to 'settings/workspace' so Ganache can get detailed information from the contract.
- Select automine = off in 'settings/server' if you want the blockchain to be incremented automatically (new block every x seconds)

#### BSC Testnet
* Already deployed, addresses available at './artifacts'
* To redeploy, $ npx truffle migrate --network testnet

### Starting the backend for prices data

- NodeJS - Express - SocketIO - MongoDB
- To start the server and get prices data for a specific interval from https://api-gm-lb.bandchain.org:

1. cd backend
2. node index.js

### Local Development

1. In the project root folder, create '.env' file with the following content. The file is excluded from the GH repo.

> MONGODB_URI=mongodb+srv://binarycatUser:7gb4NntHWlSHETjE@cluster0.a8hop.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
> UPDATE_DB=off

2. Make sure to 'npm install' both in the project root and webapp folders

3. No need to deploy contracts or running local blockchain server. The local app is connecting to the test net. Just make sure you have MetaMask Binance Network and Account configured.

4. Start local node.js server by running 'npm run start_local' in the project root folder

5. Start webapp server by running 'webapp/yarn start'