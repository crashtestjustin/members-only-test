var express = require("express");
var router = express.Router();
const passport = require("passport");
const User = require("../model/user");
const bcrypt = require("bcryptjs");

const user_controller = require("../controllers/userController");

//GET Sign Up Form
router.get("/sign-up", user_controller.user_register_get);
//POST Sign up Form
router.post("/sign-up", user_controller.user_register_post);
//GET Registration Password Page
router.get(
  "/registration-password",
  user_controller.user_register_password_get
);
//POST Registration Password Page
router.post(
  "/registration-password",
  user_controller.user_register_password_post
);
//GET User Log in
router.get("/log-in", user_controller.user_login_get);
//POST User Log in
router.post("/log-in", user_controller.user_login_post);
//GET User Logout
router.get("/logout", user_controller.user_logout);

module.exports = router;
