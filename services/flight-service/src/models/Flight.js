const mongoose = require('mongoose');
const crypto = require('crypto');

const flightSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => crypto.randomUUID(),
    unique: true
  },
  flightNumber: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  departureTime: {
    type: Date,
    required: true
  },
  arrivalTime: {
    type: Date,
    required: true
  },
  origin: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

flightSchema.methods.publish = function() {
  this.isPublished = true;
  return this.save();
};

flightSchema.methods.delete = function() {
  this.isDeleted = true;
  return this.save();
};

module.exports = mongoose.model('Flight', flightSchema);
