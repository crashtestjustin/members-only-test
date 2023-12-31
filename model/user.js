const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true, min: 1, max: 50 },
  username: { type: String, required: true, min: 1, max: 50 },
  email: { type: String, required: true, min: 5, max: 50 },
  password: { type: String, required: true, min: 4, max: 50 },
  status: {
    type: String,
    enum: ["inactive", "active"],
    default: "inactive",
    required: true,
  },
  admin: { type: Boolean, required: true, default: false },
});

userSchema.virtual("url").get(function () {
  return `/users/${this._id}`;
});

const userDB = process.env.MONGODB_USER_URI;
const userConnection = mongoose.createConnection(userDB);

const User = userConnection.model("user", userSchema, "users");

module.exports = User;
