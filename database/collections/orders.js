const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var ordersSchema = new Schema({
  idmenu       : String,
  idcliente    : String,
  street       : String,
  lat          : String,
  log          : String,
  pagototal    : Number,
  registerdate : Date
});
var order = mongoose.model("orders", ordersSchema);
module.exports = order;
