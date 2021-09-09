const router = require("express").Router();
const userCtrl = require("../controllers/userController");

router.post("/register", userCtrl.register);
<<<<<<< HEAD

router.post("/activation", userCtrl.activateEmail);
=======
router.post("/activation", userCtrl.activateEmail);
router.post("/login", userCtrl.login);
router.post("/refresh_token", userCtrl.getAccessToken);
>>>>>>> 1e5ea657cd521792500b6827e3f1f2191dfd7099

module.exports = router;
