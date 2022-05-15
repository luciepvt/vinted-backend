const express = require("express");
const router = express.Router();
const User = require("../models/User");

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

// ************************************************************************************************************************************************************************************************************//
//                                                                                              Sign Up
// ************************************************************************************************************************************************************************************************************//

router.post("/user/signup", async (req, res) => {
  try {
    const { username, email, password, newsletter } = req.fields;

    if (!username) {
      res.status(400).json({ message: "Please enter an username" });
    } else {
      const isEmailAlreadyExist = await User.findOne({
        email: email,
      });
      if (isEmailAlreadyExist !== null) {
        res
          .status(400)
          .json({ message: "this email is already linked to another account" });
      } else {
        const salt = uid2(16);
        const hash = SHA256(password + salt).toString(encBase64);
        const token = uid2(16);

        const newUser = new User({
          email: email,
          account: {
            username: username,
          },
          newsletter: newsletter,
          token: token,
          hash: hash,
          salt: salt,
        });

        newUser.save();

        res.json({
          _id: newUser._id,
          email: newUser.email,
          token: newUser.token,
          account: newUser.account,
        });
      }
    }
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});
// ************************************************************************************************************************************************************************************************************//
//                                                                                              Log In
// ************************************************************************************************************************************************************************************************************//

router.post("/user/login", async (req, res) => {
  try {
    const userToFind = await User.findOne({ email: req.fields.email });
    if (!userToFind) {
      res.status(400).json("Unauthorized 1");
    } else {
      const newHash = SHA256(req.fields.password + userToFind.salt).toString(
        encBase64
      );
      if (newHash !== userToFind.hash) {
        res.status(400).json("Unauthorized 2");
      } else {
        res.json({
          _id: userToFind._id,
          token: userToFind.token,
          account: userToFind.account,
        });
      }
    }
  } catch (error) {
    res.status(400).json({
      error: {
        message: error.message,
      },
    });
  }
});

module.exports = router;
