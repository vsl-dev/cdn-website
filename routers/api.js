const express = require("express");
const fs = require("fs");
const router = express.Router();

const config = require("../config.js");

const db = global.db;

router.get("/random/:type", (req, res) => {
  res.status(200).json({ code: 200, message: null });
});

router.get("/test", (req, res) => {
  console.log(req.get("origin"));
  res.json({ a: String(req.get("host")), b: String(req.get("origin")) });
});

router.get("/tree", (req, res) => {
  try {
    const counter = db.fetch("counter");
    const fetchDb = db.fetch("uploads");
    var list = {
      images: [],
      videos: [],
      audios: [],
      others: [],
    };

    Object.values(fetchDb).forEach((x) => {
      if (x.oldType.match("image/")) {
        list.images.push({
          id: x.id ?? null,
          url: x.url ?? null,
          file: x.file ?? null,
          size: x.size ?? null,
        });
      } else if (x.oldType.match("video/")) {
        list.videos.push({
          id: x.id ?? null,
          url: x.url ?? null,
          file: x.file ?? null,
          size: x.size ?? null,
        });
      } else if (x.oldType.match("audio/")) {
        list.audios.push({
          id: x.id ?? null,
          url: x.url ?? null,
          file: x.file ?? null,
          size: x.size ?? null,
        });
      } else {
        list.others.push({
          id: x.id ?? null,
          url: x.url ?? null,
          file: x.file ?? null,
          size: x.size ?? null,
        });
      }
    });
    res.status(200).json({ code: 200, message: "Ok", data: list ?? {} });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
});

module.exports = router;
