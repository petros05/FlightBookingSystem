const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Initialize admin user if it doesn't exist
 * This runs on server startup to ensure at least one admin exists
 */
async function initAdmin() {
  try {
    // Check if any admin exists
    const existingAdmin = await User.findOne({ where: { role: 'Administrator' } });
    
    if (existingAdmin) {
      return { created: false, message: 'Admin user already exists' };
    }

    // Get admin credentials from environment variables or use defaults
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminDisplayName = process.env.ADMIN_DISPLAY_NAME || 'System Administrator';

    // Check if username already exists (as passenger)
    const existingUser = await User.findOne({ where: { userName: adminUsername } });
    if (existingUser) {
      return { 
        created: false, 
        message: `Username "${adminUsername}" already exists. Please set ADMIN_USERNAME environment variable to a different value.` 
      };
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    // Create admin user
    const admin = await User.create({
      userName: adminUsername,
      passwordHash: passwordHash,
      role: 'Administrator',
      displayName: adminDisplayName,
      identityCardNumber: null // Admins don't need ID card
    });

    return { 
      created: true, 
      message: 'Admin user created successfully',
      username: adminUsername,
      password: adminPassword
    };
  } catch (error) {
    return { 
      created: false, 
      message: `Error creating admin user: ${error.message}`,
      error: error
    };
  }
}

module.exports = { initAdmin };
