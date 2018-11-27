const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/restaurant");
module.exports = mongoose;
