const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  schemeCode: { type: Number, index: true, required: true },
  nav: { type: Number, required: true },
  date: { type: String },
  createdAt: { type: Date, default: Date.now }
});
schema.index({ schemeCode: 1, date: -1 });
module.exports = mongoose.model('FundNavHistory', schema);
