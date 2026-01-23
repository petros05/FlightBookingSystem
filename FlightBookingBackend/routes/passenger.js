const express = require('express');
const router = express.Router();
const { authMiddleware, passengerOnly } = require('../middleware/auth');

// Get passenger profile
router.get('/profile', [authMiddleware, passengerOnly], async (req, res) => {
  try {
    const { Passenger } = require('../models/User');
    const userId = req.user._id || req.user.userId;
    const passenger = await Passenger.findById(userId).select('-passwordHash');
    
    if (!passenger) {
      return res.status(404).json({ message: 'Passenger not found' });
    }

    res.json({
      id: passenger.id,
      userName: passenger.userName,
      displayName: passenger.displayName,
      identityCardNumber: passenger.identityCardNumber,
      role: passenger.role
    });
  } catch (error) {
    console.error('Get passenger profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update passenger profile
router.put('/profile', [authMiddleware, passengerOnly], async (req, res) => {
  try {
    const { Passenger } = require('../models/User');
    const userId = req.user._id || req.user.userId;
    const passenger = await Passenger.findById(userId);
    
    if (!passenger) {
      return res.status(404).json({ message: 'Passenger not found' });
    }

    const { displayName, identityCardNumber } = req.body;
    if (displayName !== undefined) passenger.displayName = displayName;
    if (identityCardNumber !== undefined) passenger.identityCardNumber = identityCardNumber;

    await passenger.save();
    res.json({
      id: passenger.id,
      userName: passenger.userName,
      displayName: passenger.displayName,
      identityCardNumber: passenger.identityCardNumber
    });
  } catch (error) {
    console.error('Update passenger profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
