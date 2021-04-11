const bodyParser = require("body-parser");
const cors = require("cors");
const logger = require("morgan");

module.exports = app => {
  app.use(bodyParser.urlencoded({ extended: false })); // Parsing urlencoded bodies
  app.use(bodyParser.json()); // Ability to send JSON responses
  app.use(logger("dev")); // Log requests to API using morgan
  app.use(cors()); // Enables Cross-Origin Resource Sharing

  console.log("Express ready!");
};
