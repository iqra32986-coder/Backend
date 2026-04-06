const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tableNumber: { type: String, required: true },
  reservationDate: { type: String, default: () => new Date().toLocaleDateString() },
  reservationTime: { type: String, default: () => new Date().toLocaleTimeString() },
  arrivalTime: { type: String }, 
  status: { 
    type: String, 
    default: 'Pending' 
  },
  liveLocation: {
      lat: Number,
      lng: Number,
      address: String
  },
  guestName: { type: String },
  guestPhone: { type: String },
  preOrderedItems: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    qty: { type: Number, default: 1 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
