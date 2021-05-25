const execSync = require('child_process').execSync;
const fs = require('fs');

let args = process.argv.slice(2);
const usageString = `
  Usage:
    <network> <interval> 

  Possible networks are:
    testnet
    development

  interval: time in seconds between calls.
 `

if(args.length === 0) {
  console.log(usageString)
  return;
}


const network = " --network " + args[0]
const interval = args[1]

function updatePrice () {

try {
  const command = "npx truffle exec scripts/update_price.js" + network
  const output = execSync(command, {encoding: 'utf-8'})
  console.log(output)
}
catch (error) {
  console.log(error)
}
}

var timer = setInterval(updatePrice, interval); // call every 1000 milliseconds
