# BIN 
## Blockchain
### Requirements
* node 14.x
* [Truffle Ganache](trufflesuite.com/ganache)

### Setup
On home folder:
'''console
$npm install
'''

### Deploy Contracts (localy)
1) Open Truffle Ganache
2) $npx truffle compile
3) $npx truffle migrate --reset
4) $npx truffle deploys
Now contracts are deployed on Ganache simulated blockchain and contracts artifacts can be found in './build/contracts/'
