// import du modele User
const User = require("../models/User");
// ************************************************************************************************************************************************************************************************************//
//                                                                                              Middleware isAuthenticated
// ************************************************************************************************************************************************************************************************************//

const isAuthenticated = async (req, res, next) => {
  // on vérifie si l'utilisateur est authentifié à partir de son token en bdd
  if (req.headers.authorization) {
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });
    if (!user) {
      res.status(400).json("Unauthorized"); // token non valide
    } else {
      // création de la clé user dans req.
      req.user = user;
      next();
    }
  } else {
    res.status(401).json("Unauthorized"); // token pas envoyé
  }
};

module.exports = isAuthenticated;
