const { Registration } = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { CLIENT_URL } = process.env;
const sendMail = require("./sendMail");
const { Registration } = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { CLIENT_URL } = process.env;
const sendMail = require("./sendMail");

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

      res.json({
        msg: "Register Success! Please activate your email to start.",
      });
      res.json({
        msg: "Register Success! Please activate your email to start.",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  activateEmail: async (req, res) => {
    try {
      const { activation_token } = req.body;
      const user = jwt.verify(
        activation_token,
        process.env.ACTIVATION_TOKEN_SECRET
      );

      console.log(user);
      const { shopname, shopaddress, phonenumber, email, password } = user;
      const check = await Registration.findOne({ email });
      if (check)
        return res.status(400).json({ msg: "This email already exists" });
      const newUser = new Registration({
        shopname,
        shopaddress,
        phonenumber,
        email,
        password,
      });
      await newUser.save();
      res.json({ msg: "Account has been activated!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  activateEmail: async (req, res) => {
    try {
      const { activation_token } = req.body;
      const user = jwt.verify(
        activation_token,
        process.env.ACTIVATION_TOKEN_SECRET
      );

      console.log(user);
      const { shopname, shopaddress, phonenumber, email, password } = user;
      const check = await Registration.findOne({ email });
      if (check)
        return res.status(400).json({ msg: "This email already exists" });
      const newUser = new Registration({
        shopname,
        shopaddress,
        phonenumber,
        email,
        password,
      });
      await newUser.save();
      res.json({ msg: "Account has been activated!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Users.fndOne({ email });
      if (!user)
        return res.status(400).json({ msg: "This email does not exist." });

      const isMatch = await bcrypt.compare(password, userpassword);
      if (!isMatch)
        return res.status(400).json({ msg: "Password is incorrect." });

      const refresh_token = createRefreshToken({ id: user_id });

      console.log(user);
      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 100,
      });

      res.json({ msg: "Login success" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getAccessToken: (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      console.log(rf_token);
      if (!rf_token) return res.status(400).json({ msg: "Please login now!" });

      jwt.verify(rf_token);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
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
