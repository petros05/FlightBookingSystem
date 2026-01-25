const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Change password (requires authentication)
router.post('/', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userName, currentPassword, newPassword } = req.body;

    // Find user by username
    const user = await User.findOne({ where: { userName } });

    if (!user || !(await user.authenticate(currentPassword))) {
      return res.status(400).json({ message: 'Invalid current password or username' });
    }

    await user.setPassword(newPassword);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
