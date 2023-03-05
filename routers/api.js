const express = require("express");
const fs = require("fs");
const router = express.Router();

const config = require("../config.js");

const db = global.db;

router.use((req, res, next) => {
  if (config.securityLevel !== 0) {
    if (req.get("Authorization") !== config.authKey)
      return res.status(401).json({ code: 401, message: "Access denied" });
  }
  next();
});

router.get("/random/:type", (req, res) => {
  res.status(200).json({ code: 200, message: null });
});

router.get("/file/:fileID", (req, res) => {
  const id = req.params.fileID;
  const findFile = db.fetch(`uploads.${id}`);
  if (findFile === null)
    return res.status(404).json({ code: 404, message: "File not found" });
  res.status(200).json({ code: 200, message: "Ok", data: findFile ?? {} });
});

router.get("/files", (req, res) => {
  try {
    var list = {};
    const { sort } = req.query;
    const counter = db.fetch("counter");
    const fetchDb = db.fetch("uploads");
    switch (sort) {
      case "type":
        list = {
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
        break;
      case "list":
        list = [];
        Object.values(fetchDb)
          .sort((a, b) => {
            return b - a;
          })
          .forEach((x) => {
            list.push({
              id: x.id ?? null,
              url: x.url ?? null,
              file: x.file ?? null,
              size: x.size ?? null,
            });
          });
        break;
      case "size":
        list = [];
        Object.values(fetchDb)
          .sort((a, b) => {
            return b.sizeBytes - a.sizeBytes;
          })
          .forEach((x) => {
            list.push({
              id: x.id ?? null,
              url: x.url ?? null,
              file: x.file ?? null,
              size: x.size ?? null,
            });
          });
        break;
      default:
        res.redirect("/api/files?sort=type");
    }

    res.status(200).json({
      code: 200,
      message: "Ok",
      totalFiles: fs.readdirSync("./uploads").length ?? 0,
      files: list ?? {},
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
});

module.exports = router;
