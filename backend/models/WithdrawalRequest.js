// backend/models/WithdrawalRequest.js
const mongoose = require('mongoose');

const withdrawalRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  upiId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'success', 'rejected'], default: 'pending' },
  requestedAt: { type: Date, default: Date.now },
  processedAt: { type: Date }
});

module.exports = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
