// Reference model for calculating remaining seats
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight'
  },
  seat: Number,
  isCancelled: Boolean
}, {
  collection: 'orders' // Use same collection as booking-service
});

module.exports = mongoose.model('Order', orderSchema);
