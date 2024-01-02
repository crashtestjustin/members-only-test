var express = require("express");
var router = express.Router();

const message_controller = require("../controllers/messageController");

router.get("/", message_controller.index);

router.post("/delete-message", message_controller.delete_messsage_post);

router.post(
  "/delete-message-confirm",
  message_controller.delete_messsage_confirm_post
);

module.exports = router;
