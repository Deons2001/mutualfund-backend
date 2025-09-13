const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  schemeCode: { type: Number, unique: true, required: true },
  schemeName: String,
  isinGrowth: String,
  isinDivReinvestment: String,
  fundHouse: String,
  schemeType: String,
  schemeCategory: String
});
module.exports = mongoose.model('Fund', schema);
