const { Users } = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { CLIENT_URL } = process.env;
const sendMail = require("./sendMail");
const sendEmail = require("./sendMail");

const userCtrl = {
  register: async (req, res) => {
    try {
      const { shopname, shopaddress, phonenumber, email, password } = req.body;

      if (!validateEmail(email))
        return res.status(400).json({ msg: "Invalid emails." });
      const user = await Users.findOne({ email });

      if (user)
        return res.status(400).json({ msg: "This email already exists." });
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
      sendMail(email, url, "Verify your email address");

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

      const { shopname, shopaddress, phonenumber, email, password } = user;
      const check = await Users.findOne({ email });
      if (check)
        return res.status(400).json({ msg: "This email already exists" });
      const newUser = new Users({
        shopname,
        shopaddress,
        phonenumber,
        email,
        password,
      });
      await newUser.save();
      res.json({ msg: "Account has been activated!" });
    } catch (err) {
      return res
        .status(500)
        .json({ msg: err.message + " Please signup again" });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email });
      if (!user)
        return res.status(400).json({ msg: "This email does not exist." });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ msg: "Password is incorrect." });

      const refresh_token = createRefreshToken({ id: user._id });

      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ msg: "Login success" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getAccessToken: (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token) return res.status(400).json({ msg: "Please login now!" });

      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(400).json({ msg: "Please login now!" });

        const access_token = createAccessToken({ id: user.id });
        res.json({ access_token });
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await Users.findOne({ email });
      if (!user)
        return res.status(400).json({ msg: "This email does not exist." });

      const access_token = createAccessToken({ id: user._id });
      const url = `${CLIENT_URL}/user/reset/${access_token}`;

      sendEmail(email, url, "Reset your password");
      res.json({ msg: "Re-sent the password, please check your email." });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { password } = req.body;
      const passwordhash = await bcrypt.hash(password, 12);
      console.log(req.user);
      await Users.findOneAndUpdate(
        { _id: req.user.id },
        {
          password: passwordhash,
        }
      );

      res.json({ msg: "Password successfully changed!" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getUserInfor: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select("-password");
      res.json(user);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getUsersAllInfor: async (req, res) => {
    try {
      const users = await Users.find().select("-password");
      res.json(users);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("refreshtoken", { path: "/user/refresh_token" });
      return res.json({ msg: "Logged out" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  updateUser: async (req, res) => {
    try {
      const { email, phonenumber } = req.body;
      await Users.findOneAndUpdate(
        { _id: req.user.id },
        { email, phonenumber }
      );
      res.json({ msg: "Update Success!" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  updateUsersRole: async (req, res) => {
    try {
      const { role } = req.body;
      await Users.findOneAndUpdate({ _id: req.params.id }, { role });
      res.json({ msg: "Update Success!" });
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
