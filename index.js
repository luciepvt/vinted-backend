require("dotenv").config();
const express = require("express");
const formidableMiddleWare = require("express-formidable");
const mongoose = require("mongoose");
const cors = require("cors");

//connexion à la bdd

mongoose.connect(process.env.MONGODB_URI);

//création du serveur

const app = express();
app.use(formidableMiddleWare());
app.use(cors());

// importation des routes User :
const userRoutes = require("./routes/users");
// utilisation des routes User :
app.use(userRoutes);

// importation des routes Offer :
const offerRoutes = require("./routes/offers");
// utilisation des routes Offer :
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(404).json("Page Introuvable");
});

app.listen(process.env.PORT, () => {
  console.log("server has started ");
});
