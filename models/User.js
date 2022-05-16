const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: {
    unique: true,
    type: String,
  },
  account: {
    username: {
      required: true,
      type: String,
    },
    avatar: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  newsletter: Boolean,
  token: String,
  hash: String,
  salt: String,
  favorites: { type: [Object], default: [] },
});

module.exports = User;
