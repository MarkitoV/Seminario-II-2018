const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/homes");
module.exports = mongoose;
