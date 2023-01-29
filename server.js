const express = require("express");
// const rateLimiter = require("express-rate-limter");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { JsonDatabase } = require("wio.db");
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
  // res
  //   .status(401)
  //   .json({ code: 401, message: "Access Denied!", developer: "vsldev.tk" });
  res.sendFile(__dirname + "/index.html");
});

// app.use("/upload", require("./routers/upload.js")); // Api routers

const multer = require("multer");
const fs = require("fs");
const bytes = require("bytes");
const axios = require("axios");
const mime = require("mime");

const authKey = 'vsldev'

const db = global.db;

const upload = multer({ dest: "./uploads/" });

router.use((req, res, next) => {
  if (req.get("Authorization") !== authKey)
    return res.status(401).json({ code: 401, message: "Access denied" });
  next();
});

router.post("/file", upload.single("file"), (req, res) => {
  try {
    if (!req.file.mimetype.includes("image/"))
      return res.status(400).json({
        code: 400,
        message: "You cant send other type of files only image files!",
      });
    var id, tempPath, targetPath, type;
    id = db.fetch("counter") + 1;
    db.add("counter", 1);
    // fs.readdirSync("uploads/").length += 1 ?? 0
    tempPath = req.file.path;
    type = mime.getExtension(req.file.mimetype);
    targetPath = `./uploads/${id}.${type}`;

    var tags = [];
    var tagsFetch = req.body.tags
      .replaceAll(",", "")
      .replaceAll(".", "")
      .split(" ");
    tagsFetch.map((x) => {
      tags.push(`${x}`.toLowerCase());
    });
    var json = {
      id: id,
      source: "file-upload",
      url: `https://localhost:1200/uploads/${id}.${type}`,
      nsfw: req.body.nsfw ?? false,
      tags: tags ?? [],
      adeddIn: Date.now(),
      size: bytes(req.file.size),
    };

    db.set(`cdn.${id.toString()}`, json);

    fs.rename(tempPath, targetPath, (err) => {
      if (err) return console.log(err, res);

      res.status(200).json({
        code: 200,
        message: "File uploaded!",
        file: `https://localhost:1200/uploads/${id}.${type}`,
      });
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Internal server error" });
    console.log(err);
  }
});

router.post("/link", (req, res) => {
  try {
    var id;
    id = db.fetch("counter") + 1;
    db.add("counter", 1);
    var typeA = mime.getType(req.body.url);
    var type = mime.getExtension(typeA);
    if (!typeA.includes("image/"))
      return res
        .status(400)
        .json({ code: 400, message: "Invalid type of image" });
    axios({
      method: "GET",
      url: req.body.url,
      responseType: "stream",
    }).then(function (response) {
      response.data.pipe(
        fs.createWriteStream(`./uploads/${id.toString()}.${type}`)
      );
    });

    var tags = [];
    var tagsFetch = req.body.tags
      .replaceAll(",", "")
      .replaceAll(".", "")
      .split(" ");
    tagsFetch.map((x) => {
      tags.push(`${x}`.toLowerCase());
    });
    var json = {
      id: id,
      source: req.body.url,
      url: `https://localhost:1200/uploads/${id}.${type}`,
      nsfw: req.body.nsfw ?? false,
      tags: tags ?? [],
      adeddIn: Date.now(),
      size: null,
    };

    db.set(`cdn.${id.toString()}`, json);

    res.status(200).json({
      code: 200,
      message: "File uploaded!",
      file: `https://localhost:1200/uploads/${id}.${type}`,
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Internal server error" });
    console.log(err);
  }
});

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.get("/*", (req, res) => {
  res.status(404).json({ code: 404, message: "Not found" });
});

// Other

app.listen(1200, () => {
  console.log("App is running on http://localhost:1200");
});
