const app = require("express")();
const http = require("http").Server(app);
const settings = require("./config/settings");
const Web3 = require("web3");
const socketIo = require("socket.io");

const web3 = new Web3( settings.CURRENCY_FEED_URL );
const aggregatorV3InterfaceABI = [{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"description","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint80","name":"_roundId","type":"uint80"}],"name":"getRoundData","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"latestRoundData","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];
const priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, settings.CURRENCY_FEED_CONTRACT_ADDRESS);

const io = socketIo(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

var MongoClient = require("mongodb").MongoClient;
var url = settings.db;

require("./config/express")(app);
require("./routes")(app);

const sockets = [];

io.on("connect", socket => {
  console.log("SOCKET CONNETED::", socket.id);
  sockets.push(socket);
  socket.on("client-message", ({ action, payload }) => {});
});

function getPrice() {
  try {    
    priceFeed.methods.latestRoundData().call()
      .then(( roundData ) => {
        updateDB( roundData );
      });
  } catch (e) {
    console.log(e.message)
    return null
  }
}

function updateDB( data ) {
  if (data === null || typeof data === 'undefined') return;

  const price = data.answer / 100000000;
  const time = data.startedAt;
  
  var obj = { rate: parseFloat(price.toFixed(4)), time: parseInt(time) };

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("pricedb");
    dbo.collection("BNBUSD").insertOne(obj, async (err, cursor) => {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
      sockets.forEach(s => {
        s.emit("socket-message", { data: obj });
      });
    });
  });
}

if ( process.env.UPDATE_DB !== 'off' )
  var timer = setInterval(getPrice, settings.INTERVAL);

http.listen(settings.port, () =>
  console.log(`Server listening on port ${settings.port}...`)
);
