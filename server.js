const express = require("express");
// const rateLimiter = require("express-rate-limter");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");
const { JsonDatabase } = require("wio.db");
const config = require("./config.js");
const db = new JsonDatabase({
  databasePath: "./databases/database.json",
});

global.db = db;

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads")); // Uploaded files

// App

app.get("/", (req, res) => {
  res.status(401).json({ code: 401, message: "Access denied" });
});

app.get("/panel", (req, res) => {
  var key = config.authKey;
  if (req.query.key !== key) return res.sendFile(__dirname + "/login.html");
  res.sendFile(__dirname + "/panel.html");
});

app.use("/file", require("./routers/file.js")); // File uploading & deleting routers
app.use("/api", require("./routers/api.js")); // Api routers

app.get("/*", (req, res) => {
  res.status(404).json({ code: 404, message: "Not found" });
});

// Other

app.listen(config.port, () => {
  console.log("App is running on http://localhost:" + config.port);
});
