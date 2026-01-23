const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => require('crypto').randomUUID(),
    unique: true
  },
  userName: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Passenger', 'Administrator'],
    required: true
  }
}, {
  discriminatorKey: 'role',
  collection: 'users'
});

userSchema.methods.setPassword = function(password) {
  const hash = crypto.createHash('sha256');
  hash.update(password, 'utf8');
  this.passwordHash = hash.digest('base64');
};

userSchema.methods.authenticate = function(password) {
  const hash = crypto.createHash('sha256');
  hash.update(password, 'utf8');
  const passwordHash = hash.digest('base64');
  return this.passwordHash === passwordHash;
};

const User = mongoose.model('User', userSchema);

// Passenger Schema
const passengerSchema = new mongoose.Schema({
  displayName: String,
  identityCardNumber: String
});

const Passenger = User.discriminator('Passenger', passengerSchema);

// Administrator Schema
const administratorSchema = new mongoose.Schema({});

const Administrator = User.discriminator('Administrator', administratorSchema);

module.exports = { User, Passenger, Administrator };
