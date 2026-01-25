const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({
    id: user.id,
    userId: user.id,
    role: user.role
  }, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production', {
    expiresIn: '7d'
  });
};

// Register
router.post('/', [
  body('userName').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('displayName').notEmpty().withMessage('Display name is required'),
  body('identityNumber').notEmpty().withMessage('Identity number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userName, password, displayName, identityNumber } = req.body;

    // Check if username exists
    const existingUser = await User.findOne({ where: { userName } });
    if (existingUser) {
      return res.status(400).json({ message: 'User name already exists.' });
    }

    // Check if ID card exists
    const existingPassenger = await User.findOne({ where: { identityCardNumber: identityNumber } });
    if (existingPassenger) {
      return res.status(400).json({ message: 'ID card is already registered.' });
    }

    // Hash the password using bcrypt before creating user
    const bcrypt = require('bcryptjs');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new passenger with hashed password
    const passenger = await User.create({
      userName,
      displayName,
      identityCardNumber: identityNumber,
      role: 'Passenger',
      passwordHash
    });

    // Verify the user was saved to database
    const savedUser = await User.findByPk(passenger.id);
    if (!savedUser) {
      throw new Error('User was not saved to database');
    }

    const token = generateToken(passenger);
    res.status(201).json({
      token,
      user: {
        id: passenger.id,
        userName: passenger.userName,
        role: passenger.role,
        displayName: passenger.displayName
      }
    });
  } catch (error) {
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({ message: 'Database error: ' + error.message });
    }
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;
