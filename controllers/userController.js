const {Registration} = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { CLIENT_URL } = process.env;
const sendMail = require('./sendMail');

const userCtrl = {
  register: async (req, res) => {
    try {
      const { shopname, shopaddress, phonenumber, email, password } = req.body;

      if (!validateEmail(email))
        return res.status(400).json({ msg: "Invalid emails." });
      const user = await Registration.findOne({ email });

      if (user)
        return res.status.send(400).json({ msg: "This email already exists." });
      if (password.length < 6)
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 chracters long." });

      const passwordHash = await bcrypt.hash(password, 12);
      const newUser = {
        shopname,
        shopaddress,
        phonenumber,
        email,
        password: passwordHash,
      };
      const activation_token = createActivationToken(newUser);

      const url = `${CLIENT_URL}/user/activate/${activation_token}`;
      sendMail(email, url);

      res.json({ msg: "Register Success! Please activate your email to start." });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  activateEmail: async (req,res) => {
    try {
      const {activation_token} = req.body;
      const user = jwt.verify(activation_token,process.env.ACTIVATION_TOKEN_SECRET);

      console.log(user);
      const {shopname, shopaddress, phonenumber, email, password} = user;
      const check = await Registration.findOne({email});
      if(check)
        return res.status(400).json({msg: "This email already exists"});
      const newUser = new Registration({
        shopname, shopaddress, phonenumber, email, password
      });
      await newUser.save();
      res.json({msg: "Account has been activated!"});

    } catch(err){
      return res.status(500).json({msg: err.message});
    }
  }
};

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const createActivationToken = (payload) => {
  return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {
    expiresIn: "5m",
  });
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = userCtrl;
