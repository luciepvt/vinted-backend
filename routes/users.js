// Import d'express pour pouvoir faire express.Router
const express = require("express");
const router = express.Router();

// import du modele User
const User = require("../models/User");

// installation du package crypto
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

// ************************************************************************************************************************************************************************************************************//
//                                                                                              Sign Up
// ************************************************************************************************************************************************************************************************************//

router.post("/user/signup", async (req, res) => {
  try {
    // gestion des erreurs

    if (!req.fields.username) {
      // commencer par le username car paramètres body qui nécessitent moins d'énergie qu'une recherche dans la bdd
      res.status(400).json({
        error: {
          message: "missing parameter",
        },
      });
    } else {
      // une fois qu'on checke le username, on peut procéder à la recherche dans la bdd
      const isMailExisting = await User.findOne({
        email: req.fields.email,
      });
      if (isMailExisting !== null) {
        res.status(400).json({
          error: {
            message: "this email already has an account",
          },
        });
      } else {
        // 1. hasher le mdp
        const password = req.fields.password;
        const salt = uid2(16);
        const hash = SHA256(password + salt).toString(encBase64);
        const token = uid2(16);
        // 2. créer un nouvel utilisateur
        const newUser = new User({
          email: req.fields.email,
          account: {
            username: req.fields.username,
            avatar: "",
          },
          newsletter: req.fields.newsletter,
          token: token,
          hash: hash,
          salt: salt,
        });
        await newUser.save();
        res.json({
          // ne surtout pas envoyer le salt et le hash
          _id: newUser.id,
          token: newUser.token,
          account: {
            username: newUser.account.username,
          },
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
    const user = await User.findOne({ email: req.fields.email });
    //console.log(user);
    if (user === null) {
      res.status(401).json({ message: "Unauthorized" });
    } else {
      const password = req.fields.password;
      const salt = user.salt;
      const hash = SHA256(password + salt).toString(encBase64);
      if (user.hash !== hash) {
        res.status(400).json({
          error: {
            message: "Unauthorized",
          },
        });
      } else {
        res.json({
          _id: user.id,
          token: user.token,
          account: {
            username: user.account.username,
          },
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
