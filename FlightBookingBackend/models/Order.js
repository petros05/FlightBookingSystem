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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

orderSchema.methods.pay = async function() {
  await this.populate('flight');
  this.price = this.flight.price;
  this.isPaid = true;
  return this.save();
};

orderSchema.methods.cancel = function() {
  this.isCancelled = true;
  return this.save();
};

orderSchema.methods.getStatus = async function() {
  if (this.isCancelled) {
    return 'CANCELLED';
  }
  if (this.isPaid) {
    return 'PAID';
  }
  await this.populate('flight');
  if (new Date(this.flight.departureTime) < new Date()) {
    return 'EXPIRED';
  }
  return 'UNPAID';
};

orderSchema.virtual('status').get(async function() {
  return await this.getStatus();
});

orderSchema.methods.getPrice = async function() {
  if (this.isPaid) {
    return this.price;
  }
  await this.populate('flight');
  return this.flight.price;
};

module.exports = mongoose.model('Order', orderSchema);
