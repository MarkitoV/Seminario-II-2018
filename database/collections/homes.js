const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var homeSchema = new Schema({
  street : String,
  descripcion : String,
  price : Number,
  lat : Number,
  lon : Number,
  neighborhood: String,
  city: String,
  gallery: Array,
  contact: String
});
var home = mongoose.model("user", homeSchema);
module.exports = home;
