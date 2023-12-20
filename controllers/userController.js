const User = require("../model/user");
const Message = require("../model/messages");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcryptjs");

exports.user_register_get = asyncHandler(async (req, res, next) => {
  res.render("sign-up-form", {
    errors: [],
  });
});

const minTwoWords = (value) => {
  const words = value.split(" ");
  return words.length >= 2;
};

const existingUsername = async (value) => {
  const user = await User.findOne({ username: value });
  if (user) {
    return Promise.reject("username already exists");
  } else {
    return Promise.resolve();
  }
};

const passwordMatch = (value, { req }) => {
  const password = req.body.password;
  const confirmPass = value;
  console.log(password, typeof password);
  console.log(confirmPass, typeof confirmPass);

  return new Promise((resolve, reject) => {
    if (confirmPass === password) {
      resolve();
    } else {
      reject(new Error("password do not match"));
    }
  });
};

exports.user_register_post = [
  body("name", "name must be minimum 2 words")
    .trim()
    .custom(minTwoWords)
    .escape(),
  body("username", "username must be a minimum of 3 characters")
    .trim()
    .isLength({ min: 2 })
    .custom(existingUsername)
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
  body("confirm-password")
    .trim()
    .custom(passwordMatch)
    .withMessage("passwords do not match")
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors.array());

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      status: "inactive",
      admin: false,
    });

    try {
      if (!errors.isEmpty()) {
        return res.render("sign-up-form", {
          user: user,
          password: req.body.password,
          errors: errors.array(),
        });
      }

      await user.save();
      res.redirect(
        `/registration-password?name=${user.name}&username=${user.username}`
      );
    } catch (err) {
      return next(err);
    }
  }),
];

exports.user_register_password = asyncHandler(async (req, res, next) => {
  const name = req.query.name;
  const username = req.query.username;
  res.render("sign-up-password", {
    name: name,
    username: username,
  });
});
