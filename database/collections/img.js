const mongoose = require("../connect");
var imgSchema = {
  name : String,
  physicalpath : String,
  relativepath : String
};
var img = mongoose.model("img", imgSchema);
module.exports = img;
