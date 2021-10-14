var MongoClient = require("mongodb").MongoClient;
var url = process.env.MONGODB_URI;

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("pricedb");
  dbo
    .collection("BNBUSD")
    .find({})
    .toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
    });
});
