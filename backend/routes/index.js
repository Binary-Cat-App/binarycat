var MongoClient = require("mongodb").MongoClient;
const moment = require("moment");
const settings = require("../config/settings");
var url = settings.db;

module.exports = app => {
  app.get("/", (req, res) => {
    res
      .status(200)
      .send("Hello")
      .end();
  });

  app.post("/", (req, res) => {
    const { from, to } = req.body;
    console.log(from, to);
    MongoClient.connect(
      url,
      { useUnifiedTopology: true, useNewUrlParser: true },
      (err, db) => {
        if (err) throw err;
        var dbo = db.db("pricedb");
        dbo
          .collection("BNBUSD")
          .find(
            { time: { $gte: Number(from), $lte: Number(to) } },
            async (err, cursor) => {
              if (err) throw err;
              const result = await cursor.toArray();
              db.close();
              res.json({ success: true, result });
            }
          );
      }
    );
  });

  app.all("*", (req, res) => {
    res
      .status(404)
      .send("404 Not Found!")
      .end();
  });
};
