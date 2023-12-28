const Message = require("../model/messages");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  //   const messages = Messages.find().exec();

  res.render("index", {
    title: "Message Board",
    user: req.isAuthenticated() ? req.user : null,
  });
});
