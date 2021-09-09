const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    shopname: {
      type: String,
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

const Registration = mongoose.model("user_details", registrationSchema);

module.exports = { Registration };
