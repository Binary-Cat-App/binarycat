var MongoClient = require("mongodb").MongoClient;
var url =
  "mongodb+srv://img_bank:Poznai12@images.fnm4n.mongodb.net/pricedb?retryWrites=true&w=majority";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});
