var express = require("express");
var router = express.Router();
const passport = require("passport");
const User = require("../model/user");
const bcrypt = require("bcryptjs");

//GET Sign Up Form
router.get("/sign-up", function (req, res, next) {
  res.render("sign-up-form");
});

module.exports = router;
