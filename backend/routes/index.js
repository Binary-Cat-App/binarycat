const path = require('path');
const express = require('express');
var MongoClient = require("mongodb").MongoClient;
const moment = require("moment");
const settings = require("../config/settings");

module.exports = app => {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../../webapp/build')));

  app.post("/api/prices", (req, res) => {
    const { from, to } = req.body;
    MongoClient.connect(
      settings.dbURL,
      { useUnifiedTopology: true, useNewUrlParser: true },
      (err, db) => {
        if (err) throw err;
        var dbo = db.db(settings.database);
        dbo
          .collection(settings.collection)
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

  // The "catchall" handler: for any request that doesn't
  // match one above, send back React's index.html file.
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../webapp/build/index.html'));
  });
};
