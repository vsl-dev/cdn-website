const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const bytes = require("bytes");
const axios = require("axios");
const mime = require("mime");

const config = require("../config.js");

const authKey = config.authKey;

const db = global.db;

const upload = multer({ dest: "./uploads/" });

router.use((req, res, next) => {
  if (req.get("Authorization") !== authKey)
    return res.status(401).json({ code: 401, message: "Access denied" });
  next();
});

router.post("/upload/file", upload.single("file"), (req, res) => {
  try {
    if (!config.uploadOnly.includes("all"))
      if (!config.uploadOnly.some((a) => req.file.mimetype.match(a)))
        return res.status(400).json({
          code: 400,
          message: "Invalid type",
        });
    var id, tempPath, targetPath, typeA, type;
    id = db.fetch("counter") + 1;
    db.add("counter", 1);
    tempPath = req.file.path;
    typeA = mime.getExtension(req.file.mimetype);
    type = req.file.mimetype.includes("image/")
      ? config.convertImagesTo === "default"
        ? typeA
        : config.convertImagesTo
      : typeA;
    targetPath = `./uploads/${id}.${
      req.file.mimetype.includes("image/")
        ? config.convertImagesTo === "default"
          ? type
          : config.convertImagesTo
        : type
    }`;

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
      file: id + "." + type,
      oldType: req.file.mimetype,
      nsfw: req.body.nsfw ?? false,
      tags: tags ?? [],
      adeddIn: Date.now(),
      size: bytes(req.file.size),
    };

    db.set(`uploads.${id.toString()}`, json);

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

router.post("/upload/link", (req, res) => {
  try {
    var typeA, typeB, type, id;
    typeA = mime.getType(req.body.url);
    typeB = mime.getExtension(typeA);
    type = typeA.includes("image/")
      ? config.convertImagesTo === "default"
        ? typeB
        : config.convertImagesTo
      : typeB;
    if (!config.uploadOnly.includes("all"))
      if (!config.uploadOnly.some((a) => typeA.match(a)))
        return res.status(400).json({ code: 400, message: "Invalid type" });
    id = db.fetch("counter") + 1;
    db.add("counter", 1);
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
      file: id + "." + type,
      oldType: typeA,
      nsfw: req.body.nsfw ?? false,
      tags: tags ?? [],
      adeddIn: Date.now(),
      size: null,
    };

    db.set(`uploads.${id.toString()}`, json);

    res.status(200).json({
      code: 200,
      message: "File uploaded!",
      file: `https://localhost:1200/uploads/${id}.${type}`,
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Internal server error" });
    console.log("File Upload Error Link:", err);
  }
});

router.post("/delete", (req, res) => {
  try {
    const { file } = req.body;
    const info = Object.values(db.fetch(`uploads`)).find(
      (x) => x.file === file
    );
    fs.exists("./uploads/" + file, (e) => {
      if (e) {
        if (info !== undefined) db.delete(`uploads.${info.id}`);
        fs.unlinkSync("./uploads/" + file);
        return res.status(200).json({ code: 200, message: "File deleted" });
      } else {
        return res.status(404).json({ code: 404, message: "File not found" });
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Internal server error" });
    console.log("File Deleting Error:", err);
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
