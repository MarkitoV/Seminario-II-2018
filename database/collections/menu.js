const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var menusSchema = new Schema({
  name         : String,
  price        : Number,
  property     : String,
  description  : String,
  registerdate : Date,
  picture      : String,
  idrestaurant : String  
});
var menus = mongoose.model("menus", menusSchema);
module.exports = menus;
