const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { Passenger, Administrator } = require('../models/User');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ 
    _id: user._id,
    userId: user._id,
    role: user.role 
  }, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production', {
    expiresIn: '7d'
  });
};

// Login
router.post('/login', [
  body('userName').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userName, password } = req.body;

    // Try administrator first
    let user = await Administrator.findOne({ userName });
    if (!user) {
      // Try passenger
      user = await Passenger.findOne({ userName });
    }

    if (!user || !user.authenticate(password)) {
      return res.status(401).json({ message: 'Invalid user name or password' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        userName: user.userName,
        role: user.role,
        displayName: user.displayName || null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register
router.post('/register', [
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
    const existingUser = await Passenger.findOne({ userName });
    if (existingUser) {
      return res.status(400).json({ message: 'User name already exists.' });
    }

    // Check if ID card exists
    const existingPassenger = await Passenger.findOne({ identityCardNumber: identityNumber });
    if (existingPassenger) {
      return res.status(400).json({ message: 'ID card is already registered.' });
    }

    // Create new passenger
    const passenger = new Passenger({
      userName,
      displayName,
      identityCardNumber: identityNumber,
      role: 'Passenger'
    });
    passenger.setPassword(password);
    await passenger.save();

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
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', require('../middleware/auth').authMiddleware, async (req, res) => {
  try {
    const { User } = require('../models/User');
    const user = await User.findById(req.user._id || req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user.id,
      userName: user.userName,
      role: user.role,
      displayName: user.displayName || null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.post('/change-password', [
  require('../middleware/auth').authMiddleware,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const { User } = require('../models/User');
    const user = await User.findById(req.user._id || req.user.userId);
    
    if (!user || !user.authenticate(currentPassword)) {
      return res.status(400).json({ message: 'Invalid current password' });
    }

    user.setPassword(newPassword);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
