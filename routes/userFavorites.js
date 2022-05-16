const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleWares/isAuthenticated");

router.post("/favorites/update", isAuthenticated, async (req, res) => {
  try {
    const { favorites } = req.fields;
    if (favorites) {
      req.user.favorites = favorites;
    }
    await req.user.save();
    res.status(200).json(req.user);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});
module.exports = router;
