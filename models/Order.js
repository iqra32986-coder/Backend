const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'RestaurantProfile', required: true }, // Order split per restaurant
  items: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    qty: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled', 'Rejected', 'In-Check'], default: 'Pending' },
  customerContact: {
    name: String,
    email: String,
    phone: String
  },
  liveLocation: {
    lat: Number,
    lng: Number,
    address: String
  },
  trackingId: { type: String, unique: true },
  tableNumber: { type: String },
  paymentMethod: { type: String, enum: ['COD', 'JazzCash', 'Easypaisa'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' }


}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
