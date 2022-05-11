require("dotenv").config();
const express = require("express");
const formidableMiddleWare = require("express-formidable");
const mongoose = require("mongoose");
const cors = require("cors");
const stripe = require("stripe")(process.env.SECRET_KEY);

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

app.post("/payment", async (req, res) => {
  const stripeToken = req.fields.stripeToken;
  const response = await stripe.charges.create({
    amount: 2000,
    currency: "eur",
    description: "La description de l'objet acheté",
    // On envoie ici le token
    source: stripeToken,
  });
  console.log(response.status);
  res.json(response);
});
app.all("*", (req, res) => {
  res.status(404).json("Page Introuvable");
});

app.listen(process.env.PORT, () => {
  console.log("server has started ");
});
