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
router.get("/registration-password", user_controller.user_register_password);

module.exports = router;
