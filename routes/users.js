const express = require("express");
const router = express.Router();
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// ************************************************************************************************************************************************************************************************************//
//                                                                                              Sign Up
// ************************************************************************************************************************************************************************************************************//

router.post("/user/signup", async (req, res) => {
  try {
    const { username, email, password, newsletter, favorites } = req.fields;

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
            avatar: await cloudinary.uploader.upload(req.files.picture.path, {
              folder: "vinted/usersavatar",
              public_id: `${username}`,
            }).secure_url,
          },
          newsletter: newsletter,
          token: token,
          hash: hash,
          salt: salt,
          favorites: favorites,
        });

        newUser.save();

        res.json({
          _id: newUser._id,
          email: newUser.email,
          token: newUser.token,
          account: newUser.account,
          favorites: newUser.favorites,
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
    const loggedUser = await User.findOne({ email: req.fields.email });
    if (loggedUser === null) {
      res.status(400).json("Unauthorized 1");
    } else {
      const newHash = SHA256(req.fields.password + loggedUser.salt).toString(
        encBase64
      );
      if (newHash !== loggedUser.hash) {
        res.status(400).json("Unauthorized 2");
      } else {
        res.json({
          _id: loggedUser._id,
          token: loggedUser.token,
          account: loggedUser.account,
          favorites: loggedUser.favorites,
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
