var MongoClient = require("mongodb").MongoClient;
var url =
  "mongodb+srv://binarycat:Kna7jS2TZbUtYI9Q@binarycat.xkmsg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});
