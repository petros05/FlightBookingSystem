const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Register user by admin (auto-generate username and password from ID)
router.post('/', [
  body('displayName').notEmpty().withMessage('Display name is required'),
  body('identityCardNumber').notEmpty().withMessage('Identity card number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { displayName, identityCardNumber } = req.body;

    // Check if ID card already exists
    const existingPassenger = await User.findOne({ where: { identityCardNumber } });
    if (existingPassenger) {
      return res.status(400).json({ 
        success: false,
        message: 'ID card is already registered.' 
      });
    }

    // Generate username from identity card number (last 8 digits)
    const username = `user_${identityCardNumber.slice(-8)}`;
    
    // Check if username already exists, if so, append a number
    let finalUsername = username;
    let counter = 1;
    while (await User.findOne({ where: { userName: finalUsername } })) {
      finalUsername = `${username}_${counter}`;
      counter++;
    }

    // Generate password from identity card number (last 6 digits)
    const password = identityCardNumber.slice(-6);

    // Hash the password using bcrypt before creating user
    const bcrypt = require('bcryptjs');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new passenger with hashed password
    const passenger = await User.create({
      userName: finalUsername,
      displayName,
      identityCardNumber: identityCardNumber,
      role: 'Passenger',
      passwordHash
    });

    res.status(201).json({
      success: true,
      user: {
        id: passenger.id,
        userName: passenger.userName,
        displayName: passenger.displayName,
        identityCardNumber: passenger.identityCardNumber,
        role: passenger.role
      },
      generatedPassword: password // Return password so admin can inform passenger
    });
  } catch (error) {
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({ 
        success: false,
        message: 'Database error: ' + error.message 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message 
    });
  }
});

module.exports = router;
