const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// Get current user info
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id || req.user.userId);
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

module.exports = router;