const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  schemeCode: { type: Number, required: true, index: true },
  units: { type: Number, required: true },
  purchaseDate: { type: String },
  purchaseNav: { type: Number },
  investedValue: { type: Number },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Portfolio', schema);
