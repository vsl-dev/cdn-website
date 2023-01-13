const express = require("express");
const router = express.Router();

router.get("/random/:type", (req, res) => {
  res.status(200).json({ code: 200, message: null });
});

module.exports = router;
