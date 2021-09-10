const router = require("express").Router();
const userCtrl = require("../controllers/userController");
const auth = require("../Middleware/auth");
const authAdmin = require("../Middleware/authAdmin");

router.post("/register", userCtrl.register);
router.post("/activation", userCtrl.activateEmail);
router.post("/login", userCtrl.login);
router.post("/refresh_token", userCtrl.getAccessToken);
router.post("/forgot", userCtrl.forgotPassword);
router.post("/reset", auth, userCtrl.resetPassword);
router.get("/infor", auth, userCtrl.getUserInfor);
router.get("/all_infor", auth, authAdmin, userCtrl.getUsersAllInfor);

module.exports = router;
