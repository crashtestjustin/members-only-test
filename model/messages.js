const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  text: { type: String, required: true, min: 1, max: 150 },
  posted: { type: Date, required: true },
  user: { type: Schema.Types.ObjectId, ref: "user", required: true },
});

messageSchema.virtual("url").get(function () {
  return `/messages/${this._id}`;
});

const messageDB = process.env.MONGODB_MESSAGE_URI;
const messageConnection = mongoose.createConnection(messageDB);

const Message = messageConnection.model("message", messageSchema, "messages");

module.exports = Message;
