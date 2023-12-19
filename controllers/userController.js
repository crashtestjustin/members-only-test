const User = require("../model/user");
const Message = require("../model/messages");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcryptjs");

exports.user_register_get = asyncHandler(async (req, res, next) => {
  res.render("sign-up-form");
});

const minTwoWords = (value) => {
  const words = value.split(" ");
  return words.length >= 2;
};

exports.user_register_post = [
  body("name", "name must be minimum 2 words")
    .trim()
    .custom(minTwoWords)
    .escape(),
  body("username", "username must be a minimum of 3 characters")
    .trim()
    .isLength({ min: 2 })
    .escape(),
  body("email", "email address must be a valid email")
    .trim()
    .isEmail()
    .escape(),
  body(
    "password",
    "password must be minimum 6 characters and include one number"
  )
    .trim()
    .isLength({ min: 6 })
    .withMessage("must be at least 6 characters long.")
    .matches(/\d/)
    .withMessage("must include at least one number")
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    try {
      if (!errors.isEmpty()) {
        res.render("sign-up-form", {
          name: req.body.name,
          username: req.body.username,
          email: req.body.email,
          errors: errors.array(),
        });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const user = new User({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        status: "inactive",
        admin: false,
      });

      await user.save();
      res.redirect("/");
    } catch (err) {
      return next(err);
    }
  }),
];

exports.user_register_password = asyncHandler(async (req, res, next) => {
  res.render("/");
});
