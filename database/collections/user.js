const mongoose = require("../connect");
var userSchema = {
  name : String,
  altura : Number,
  peso : Number,
  edad : Number,
  sexo : String,
  email : String
};
var user = mongoose.model("user", userSchema);
module.exports = user;
