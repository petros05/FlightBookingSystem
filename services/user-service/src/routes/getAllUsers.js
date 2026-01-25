const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware, adminOnly } = require('../../middleware/auth');

// Get all passengers (Admin only)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    // Get all users with role 'Passenger'
    const passengers = await User.findAll({
      where: { role: 'Passenger' },
      attributes: [
        'id',
        'userName',
        'displayName',
        'identityCardNumber',
        'role',
        'createdAt',
        'updatedAt'
      ], // Exclude passwordHash for security
      order: [['createdAt', 'DESC']] // Most recent first
    });

    res.json({
      success: true,
      count: passengers.length,
      passengers: passengers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching passengers'
    });
  }
});

module.exports = router;
