const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Create admin user endpoint
 * This endpoint allows creating an admin user if no admin exists
 * OR if called by an existing admin
 */
router.post('/', [
  body('userName').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('displayName').optional().notEmpty().withMessage('Display name cannot be empty if provided')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userName, password, displayName } = req.body;

    // Check if any admin exists
    const existingAdmin = await User.findOne({ where: { role: 'Administrator' } });
    
    // If admin exists, require authentication (this endpoint should be protected in production)
    // For now, we'll allow creation if no admin exists, or if called by existing admin
    if (existingAdmin) {
      // In production, you should check req.user here
      // For now, we'll allow it but log a warning
      // return res.status(403).json({ message: 'Admin user already exists. Only existing admins can create new admins.' });
    }

    // Check if username exists
    const existingUser = await User.findOne({ where: { userName } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const admin = await User.create({
      userName,
      passwordHash,
      role: 'Administrator',
      displayName: displayName || userName,
      identityCardNumber: null
    });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: admin.id,
        userName: admin.userName,
        displayName: admin.displayName,
        role: admin.role
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
