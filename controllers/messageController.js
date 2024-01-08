const Message = require("../model/messages");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res, next) => {
  const messages = await Message.find()
    .populate("user")
    .sort({ posted: -1 })
    .exec();

  res.render("index", {
    title: "Message Board",
    user: req.isAuthenticated() ? req.user : null,
    messages: messages,
  });
});

exports.delete_messsage_post = asyncHandler(async (req, res, next) => {
  const messageID = req.body.messageID;
  const message = await Message.findById(messageID).populate("user").exec();
  res.render("delete-message", {
    Title: "Delete Message",
    message: message,
  });
});

exports.delete_messsage_confirm_post = asyncHandler(async (req, res, next) => {
  const messageID = req.body.messageID;
  const message = await Message.findByIdAndDelete(messageID).exec();
  res.redirect("/");
});

exports.new_message_get = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user._id) {
    res.redirect("/log-in");
    return;
  }

  res.render("new-message", {
    title: "New Message",
    errors: [],
    user: req.isAuthenticated() ? req.user : null,
  });
});

exports.new_message_post = [
  body("message", "There must be a message to submit")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("new-message", {
        title: "New Message",
        user: req.isAuthenticated() ? req.user : null,
        errors: errors.array(),
      });
    }

    if (!req.user || !req.user._id) {
      res.redirect("/log-in");
      return;
    }

    const message = new Message({
      text: req.body.message,
      posted: new Date(),
      user: req.user._id,
    });

    await message.save();
    res.redirect("/");
  }),
];
