const mongoose = require('mongoose');
const crypto = require('crypto');

const orderSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => crypto.randomUUID(),
    unique: true
  },
  seat: {
    type: Number,
    required: true
  },
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: true
  },
  passenger: {
    type: String, // Store PostgreSQL user UUID as string
    required: true
  },
  createdTime: {
    type: Date,
    default: Date.now
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  isCancelled: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number
  }
}, {
  timestamps: true
});

orderSchema.methods.pay = async function(flightData) {
  if (flightData) {
    this.price = flightData.price;
  }
  this.isPaid = true;
  return this.save();
};

orderSchema.methods.cancel = function() {
  this.isCancelled = true;
  return this.save();
};

orderSchema.methods.getStatus = async function(flightData) {
  if (this.isCancelled) {
    return 'CANCELLED';
  }
  if (this.isPaid) {
    return 'PAID';
  }
  if (flightData && new Date(flightData.departureTime) < new Date()) {
    return 'EXPIRED';
  }
  return 'UNPAID';
};

orderSchema.methods.getPrice = async function(flightData) {
  if (this.isPaid) {
    return this.price;
  }
  if (flightData) {
    return flightData.price;
  }
  return null;
};

module.exports = mongoose.model('Order', orderSchema);
