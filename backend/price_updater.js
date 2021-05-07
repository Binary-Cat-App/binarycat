const { Client } = require("@bandprotocol/bandchain.js");

// BandChain's Proof-of-Authority REST endpoint
const endpoint = "https://api-gm-lb.bandchain.org";
const client = new Client(endpoint);

PAIR = "BNB/USD";
INTERVAL = 10000; //milliseconds

async function getPrice() {
  const rate = await client.getReferenceData([PAIR]);
  return rate;
}

var MongoClient = require("mongodb").MongoClient;
var url =
  "mongodb+srv://binarycat:Kna7jS2TZbUtYI9Q@binarycat.xkmsg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
async function updateDB() {
  let price = await getPrice();
  var obj = { rate: price[0].rate, time: price[0].updatedAt.base };
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("pricedb");
    dbo.collection("BNBUSD").insertOne(obj, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });
}

var timer = setInterval(updateDB, INTERVAL); // call every 1000 milliseconds
