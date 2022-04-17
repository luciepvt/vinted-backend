// Import d'express pour pouvoir faire express.Router
const express = require("express");
const router = express.Router();

// import du modele User
const User = require("../models/User");

// installation du package crypto pour authentification
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

// ************************************************************************************************************************************************************************************************************//
//                                                                                              Sign Up
// ************************************************************************************************************************************************************************************************************//

router.post("/user/signup", async (req, res) => {
  try {
    // destructuring
    const { username, email, password, newsletter } = req.fields;
    // gestion des erreurs
    // 1. username n'est pas renseigné
    if (!username) {
      res.status(400).json({ message: "Please enter an username" });
    } else {
      // 2. email renseigné lors de l'inscription existe deja dans la bdd
      const isEmailAlreadyExist = await User.findOne({
        email: email,
      });
      if (isEmailAlreadyExist !== null) {
        res
          .status(400)
          .json({ message: "this email is already linked to another account" });
      } else {
        // 1. hasher le mdp
        const salt = uid2(16);
        const hash = SHA256(password + salt).toString(encBase64);
        const token = uid2(16);
        // 2. creer un nouvel utilisateur
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
        // 3. enregistrer en bdd
        newUser.save();

        // réponse du serveur
        res.json({
          // ne surtout pas envoyer le salt et le hash
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
    // recherche en bdd l'utilisateur à partir de l'email renseigné
    const userToFind = await User.findOne({ email: req.fields.email });
    if (!userToFind) {
      res.status(400).json("Unauthorized 1");
    } else {
      // generer un nouveau hash à partir du salt en bdd et du mdp renseigné lors de la connexion
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
