const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'RestaurantProfile', required: false }, // Optional for Platform-wide deals
  title: { type: String, required: true },
  description: { type: String },
  discountValue: { type: String }, // e.g. '20% OFF'
  price: { type: Number }, // Actual Deal Price
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
  imageUrl: { type: String },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Deal', dealSchema);
