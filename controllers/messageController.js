const Message = require("../model/messages");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  const messages = await Message.find().populate("user").exec();

  console.log(messages);

  res.render("index", {
    title: "Message Board",
    user: req.isAuthenticated() ? req.user : null,
    messages: messages,
  });
});

exports.delete_messsage_post = asyncHandler(async (req, res, next) => {
  const messageID = req.body.messageID;
  const message = await Message.findById(messageID).exec();
  console.log(`Message ID: ${message}`);
});
