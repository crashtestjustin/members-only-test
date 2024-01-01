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

exports.user_register_password_get = asyncHandler(async (req, res, next) => {
  const name = req.query.name;
  const username = req.query.username;
  const errors = [];
  res.render("sign-up-password", {
    name: name,
    username: username,
    errors: errors,
  });
});

const accessPasswordMatch = (value) => {
  const password = "mbaccess2023";
  const confirmPass = value;

  return new Promise((resolve, reject) => {
    if (confirmPass === password) {
      resolve();
    } else {
      reject(new Error("Incorrect Access Password"));
    }
  });
};

const adminPasswordMatch = (value) => {
  const password = "adminaccess2023";
  const confirmPass = value;

  return new Promise((resolve, reject) => {
    if (confirmPass === password || confirmPass === "") {
      resolve();
    } else {
      reject(new Error("Incorrect Admin Password"));
    }
  });
};

exports.user_register_password_post = [
  body("access-password", "Access Password Required for full access")
    .trim()
    .custom(accessPasswordMatch)
    .escape(),
  body(
    "admin-password",
    "Incorrect admin password. Enter a new value or remove to submit."
  )
    .trim()
    .custom(adminPasswordMatch)
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    try {
      if (!errors.isEmpty()) {
        return res.render("sign-up-password", {
          name: req.body.name,
          username: req.body.username,
          errors: errors.array(),
        });
      }

      const name = req.query.name;
      const username = req.query.username;
      const adminPassword = req.body["admin-password"];

      const updatedUser = await User.findOneAndUpdate(
        { name, username },
        {
          $set: {
            status: "active",
            admin: adminPassword ? true : false,
          },
        }
      );

      if (!updatedUser) {
        return res.status(404).send("User not found.");
      }

      const approvedUser = await User.findById(updatedUser._id);
      //   console.log(approvedUser);

      res.redirect(`/`);
    } catch (err) {
      return next(err);
    }
  }),
];

exports.user_login_get = asyncHandler(async (req, res, next) => {
  res.render("log-in-form", {
    user: {},
    errors: [],
  });
});

exports.user_login_post = (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    try {
      if (err) {
        return next(err);
      }

      if (!user) {
        console.log(user);

        if (info && info.message === "incorrect password") {
          return res.render("log-in-form", {
            errors: [{ msg: "Invalid password", path: "password" }],
            user: { username: req.body.username, password: "" },
          });
        }

        return res.render("log-in-form", {
          errors: [{ msg: "Invalid Username", path: "username" }],
          user: { username: req.body.username, password: "" },
        });
      }

      if (user.status === "inactive") {
        return res.redirect(
          `/registration-password?name=${user.name}&username=${user.username}`
        );
      }

      const messages = await Message.find().exec();

      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        console.log(`${user.username} logged in`);
        return res.render("index", {
          title: "Message Board",
          user: user,
          messages: messages,
        });
      });
    } catch (err) {
      return next(err);
    }
  })(req, res, next); // <-- Invoke the middleware by passing req, res, and next
};

exports.user_logout = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    } else {
      res.redirect("/");
    }
  });
});
