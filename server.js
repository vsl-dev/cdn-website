const express = require("express");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const cors = require("cors");
const { JsonDatabase } = require("wio.db");
const config = require("./config.js");
const db = new JsonDatabase({
  databasePath: "./databases/database.json",
});

global.db = db;

const app = express();

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 1500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 429,
    message:
      "Too many requests, you have been rate limited. Please try again later.",
  },
}); // Rate limiter

app.use(limiter);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads")); // Uploaded files
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    maxAge: 60 * 60 * 1000, // 1 Hours
  })
);

// App

app.get("/", (req, res) => {
  res.status(200).json({
    code: 200,
    message: "Ok",
    developer: "github.com/vsl-dev",
  });
});

app.use("/file", require("./routers/file.js")); // File uploading & deleting routers
app.use("/api", require("./routers/api.js")); // Api routers
app.use("/panel", require("./routers/panel.js")); // Admin panel routers

app.get("/*", (req, res) => {
  res.status(404).json({ code: 404, message: "Not found" });
});

// Other

app.listen(config.port, () => {
  console.log("App is running on http://localhost:" + config.port);
});
