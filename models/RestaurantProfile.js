const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  ownerName: { type: String },
  timings: { type: String },
  bio: { type: String },
  description: { type: String },
  location: { type: String },
  payments: {
    jazzcash: { enabled: { type: Boolean, default: false }, accountNo: String, name: String },
    easypaisa: { enabled: { type: Boolean, default: false }, accountNo: String, name: String },
    cod: { enabled: { type: Boolean, default: true } }
  },
  tables: [{
    tableNumber: { type: String, required: true },
    tableName: { type: String }, // Public Name (e.g. VIP Corner)
    capacity: { type: Number, required: true },
    isWindowSeat: { type: Boolean, default: false },
    placement: { type: String }, // e.g. "Main Hall", "Garden"
    isOrderable: { type: Boolean, default: true },
    status: { type: String, enum: ['Available', 'Reserved', 'Occupied'], default: 'Available' }
  }],
  categories: [{ type: String }] // custom categories defined by restaurant
}, { timestamps: true });

module.exports = mongoose.model('RestaurantProfile', profileSchema);
