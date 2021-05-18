var MongoClient = require("mongodb").MongoClient;
var url = process.env.MONGODB_URI;

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("pricedb");
  dbo.createCollection("BNBUSD", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
    db.close();
  });
});
