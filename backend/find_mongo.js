var MongoClient = require("mongodb").MongoClient;
var url =
  "mongodb+srv://binarycat:Kna7jS2TZbUtYI9Q@binarycat.xkmsg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

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
