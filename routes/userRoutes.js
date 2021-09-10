const router = require("express").Router();
const userCtrl = require("../controllers/userController");
const auth = require("../Middleware/auth");
const authAdmin = require("../Middleware/authAdmin");

router.post("/register", userCtrl.register);
router.post("/activation", userCtrl.activateEmail);
router.post("/login", userCtrl.login);
router.post("/refresh_token", userCtrl.getAccessToken);
router.post("/forgot", userCtrl.forgotPassword);
router.post("/logout", userCtrl.logout);
router.post("/reset", auth, userCtrl.resetPassword);
router.get("/infor", auth, userCtrl.getUserInfor);
router.get("/all_infor", auth, authAdmin, userCtrl.getUsersAllInfor);
<<<<<<< HEAD
router.patch("/update", auth, userCtrl.updateUser);
router.patch("/update_role/:id", auth, authAdmin, userCtrl.updateUsersRole);
=======
router.delete("/delete/:id", userCtrl.deleteUser);

>>>>>>> 13d32053143e9e4098cefb74d5f45ba4fe72bd73

module.exports = router;
