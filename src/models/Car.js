const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  company: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  carNumber: { type: String, required: true, trim: true },
  seatsAvailable: { type: Number, required: true, min: 1, max: 20 },
  color: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

carSchema.index({ owner: 1, carNumber: 1 }, { unique: true });

module.exports = mongoose.model('Car', carSchema);
