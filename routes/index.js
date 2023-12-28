var express = require("express");
var router = express.Router();

const message_controller = require("../controllers/messageController");

router.get("/", message_controller.index);

module.exports = router;
