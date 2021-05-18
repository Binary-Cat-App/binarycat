const app = require("express")();
const http = require("http").Server(app);
const settings = require("./config/settings");
const { Client } = require("@bandprotocol/bandchain.js");
const socketIo = require("socket.io");

// BandChain's Proof-of-Authority REST endpoint
const endpoint = "https://api-gm-lb.bandchain.org";
const client = new Client(endpoint);

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

async function getPrice() {
  const rate = await client.getReferenceData([settings.PAIR]);
  return rate;
}

async function updateDB() {
  let price = await getPrice();
  var obj = { rate: price[0].rate, time: price[0].updatedAt.base };
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
  var timer = setInterval(updateDB, settings.INTERVAL);

http.listen(settings.port, () =>
  console.log(`Server listening on port ${settings.port}...`)
);
