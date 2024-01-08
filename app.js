var createError = require("http-errors");
var express = require("express");
const mongoose = require("mongoose");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
require("dotenv").config();
const compression = require("compression");
const helmet = require("helmet");

const User = require("./model/user");

//mongoDB configuraiton
mongoose.set("strictQuery", false);

const userDB = process.env.MONGODB_USER_URI;
const messageDB = process.env.MONGODB_MESSAGE_URI;

main().catch((err) => console.log(err));
async function main() {
  try {
    await mongoose.connect(userDB);

    const messageConnection = await mongoose.createConnection(messageDB);

    messageConnection.on("connected", () => {
      console.log("connected to userDB");
      console.log("connected to messageDB");
    });
  } catch (err) {
    console.error("Error connecting to Databased", err);
  }
}

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "jade");
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression);
app.use(express.static(path.join(__dirname, "public")));

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "incorrect username" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECTRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 10000, //24 hours in milliseconds
    },
  })
);

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, //1 minute
  max: 50,
});

app.use(limiter);

var usersRouter = require("./routes/users");
var indexRouter = require("./routes/index");

app.use("/", indexRouter);
app.use("/", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
