const Message = require("../model/messages");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  const messages = await Message.find().exec();

  console.log(messages);

  res.render("index", {
    title: "Message Board",
    user: req.isAuthenticated() ? req.user : null,
    messages: messages,
  });
});
