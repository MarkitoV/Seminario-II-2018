const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var detailSchema = new Schema({
  idmenu   : String,
  idorder  : String,
  cantidad : Number
});
var detail = mongoose.model("detail", detailSchema);
module.exports = detail;
