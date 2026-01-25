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

// Login
router.post('/', [
  body('userName').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userName, password } = req.body;

    // Find user by username
    const user = await User.findOne({ where: { userName } });

    if (!user || !(await user.authenticate(password))) {
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
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({ message: 'Database error: ' + error.message });
    }
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;
