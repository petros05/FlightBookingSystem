const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Find user by identity card number
router.get('/:identityCardNumber', async (req, res) => {
  try {
    const { identityCardNumber } = req.params;

    if (!identityCardNumber) {
      return res.status(400).json({ 
        success: false,
        message: 'Identity card number is required' 
      });
    }

    const user = await User.findOne({ 
      where: { identityCardNumber },
      attributes: [
        'id',
        'userName',
        'displayName',
        'identityCardNumber',
        'role',
        'createdAt',
        'updatedAt'
      ] // Exclude passwordHash
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found with this identity card number' 
      });
    }

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while finding user'
    });
  }
});

module.exports = router;
