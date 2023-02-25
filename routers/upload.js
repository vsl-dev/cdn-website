const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const bytes = require("bytes");
const axios = require("axios");
const request = require("request");
const mime = require("mime");
const fetch = require("node-fetch");

const authKey = "vsldev";

const db = global.db;

const upload = multer({ dest: "./uploads/" });

// router.use((req, res, next) => {
//   if (req.get("Authorization") !== authKey)
//     return res.status(401).json({ code: 401, message: "Access denied" });
//   next();
// });

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
    tempPath = req.file.path;
    type = mime.getExtension(req.file.mimetype);
    // targetPath = `./uploads/${id}.${type}`; // Set type to default
    targetPath = `./uploads/${id}.webp`;

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

router.post("/link", async (req, res) => {
  try {
    var id;
    id = db.fetch("counter") + 1;
    db.add("counter", 1);
    var typeA = mime.getType(req.body.url);
    var resp = await axios.get(req.body.url);
    var size = bytes(parseInt(await resp.headers["content-length"]));
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
        // fs.createWriteStream(`./uploads/${id.toString()}.${type}`) // Set image type to default type
        fs.createWriteStream(`./uploads/${id.toString()}.webp`)
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
      size: size,
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

module.exports = router;
