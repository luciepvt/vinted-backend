// import du modele User
const User = require("../models/User");
// ************************************************************************************************************************************************************************************************************//
//                                                                                              Middleware isAuthenticated
// ************************************************************************************************************************************************************************************************************//

const isAuthenticated = async (req, res, next) => {
  //console.log(req.headers.authorization);
  if (req.headers.authorization) {
    const isUserValid = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });
    console.log(isUserValid);
    if (isUserValid) {
      //envoi des infos de user sur la route /offer/publish
      req.user = isUserValid;
      next();
    } else {
      res.status(401).json({ error: "Unauthorized" }); // token non valide
    }
  } else {
    res.status(401).json({ error: "Unauthorized" }); // token pas envoyé
  }
};

module.exports = isAuthenticated;
