# Binary Cat

## Blockchain

### Requirements

- node 14.x

### Setup

On project root folder:

\$npm install

### Starting the backend for prices data

- NodeJS - Express - SocketIO - MongoDB
- To start the server and get prices data for a specific interval from https://api.avax-test.network/ext/bc/C/rpc

1. cd backend
2. node index.js

### Local Development

1. In the project root folder, create '.env' file with the following content. The file is excluded from the GH repo.

> MONGODB_URI=mongodb+srv://binarycatUser:7gb4NntHWlSHETjE@cluster0.a8hop.mongodb.net/myFirstDatabase?retryWrites=true&w=majority

> CURRENCY_FEED_URL=https://api.avax-test.network/ext/bc/C/rpc

> CURRENCY_FEED_CONTRACT_ADDRESS=0x86d67c3D38D2bCeE722E601025C25a575021c6EA

> CURRENCY_FEED_INTERVAL=30000

> UPDATE_DB=off

2. Make sure to 'npm install' both in the project root and webapp folders

3. No need to deploy contracts or running local blockchain server. The local app is connecting to the test net. Just make sure you have MetaMask Binance Network and Account configured.

4. Start local node.js server by running 'npm run start_local' in the project root folder

5. Start webapp server by running 'webapp/yarn start'
