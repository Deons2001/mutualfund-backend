const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  schemeCode: { type: Number, index: true, unique: true, required: true },
  nav: { type: Number, required: true },
  date: { type: String },
  updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('FundLatestNav', schema);
