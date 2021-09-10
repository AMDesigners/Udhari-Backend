const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    role: {
      type: Number
    },
    shopname: {
      type: String,
    },
    role: {
      type: Number,
    },
    shopaddress: {
      type: String,
      unique: true,
    },
    phonenumber: {
      type: Number,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Users = mongoose.model("user_details", registrationSchema);

module.exports = { Users };
