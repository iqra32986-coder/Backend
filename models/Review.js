const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['Restaurant', 'MenuItem'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Id of restaurant or item
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Deleted', 'Edited'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
