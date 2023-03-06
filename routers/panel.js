const express = require("express");
const fs = require("fs");
const bytes = require("bytes");
const router = express.Router();

const config = require("../config.js");

const db = global.db;

if (config.panel.panelEnabled) {
  const isLoggedIn = (req, res, next) => {
    var loginHtml = fs.readFileSync("./pages/login.html", "utf8");
    const { username, password } = req.session;
    if (
      username === config.panel.username &&
      password === config.panel.password
    )
      return next();
    else return res.send(loginHtml);
  };

  router.post("/login", (req, res) => {
    try {
      const username = req.body.username;
      const password = req.body.password;
      if (
        username === config.panel.username &&
        password === config.panel.password
      ) {
        req.session.username = username;
        req.session.password = password;
        console.log("Admin panel login -", new Date().toTimeString());
        return res
          .status(200)
          .json({ code: 200, message: "Success", failed: false });
      } else {
        return res
          .status(200)
          .json({ code: 400, message: "Fail", failed: true });
      }
    } catch (err) {
      res.status(500).json({ code: 500, message: "Error", failed: true });
      console.log(err);
    }
  });

  router.post("/logout", (req, res) => {
    req.session = null;
    res.status(200).json({ code: 200, refresh: true, failed: false });
  });

  router.get("/", isLoggedIn, (req, res) => {
    var panelHtml = fs.readFileSync("./pages/panel.html", "utf8");
    var panelEdited = panelHtml
      .replace("###SECURITY_LEVEL###", config.securityLevel)
      .replace("###TRUSTED_DOMAINS###", config.trustedDomains)
      .replace("###UPLOAD_LIMIT###", config.uploadLimit)
      .replace("###SIZE_LIMIT###", bytes(config.sizeLimit))
      .replace("###CONVERT_IMGS###", config.convertImagesTo)
      .replace("###UPLOAD_ONLY###", config.uploadOnly)
      .replace("###AUTHKEY###", config.authKey);
    res.send(panelEdited);
  });
}

module.exports = router;
