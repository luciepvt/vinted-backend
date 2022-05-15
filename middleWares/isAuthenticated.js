const User = require("../models/User");
// ************************************************************************************************************************************************************************************************************//
//                                                                                              Middleware isAuthenticated
// ************************************************************************************************************************************************************************************************************//

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });
    if (!user) {
      res.status(400).json("Unauthorized");

      req.user = user;
      next();
    }
  } else {
    res.status(401).json("Unauthorized");
  }
};

module.exports = isAuthenticated;
