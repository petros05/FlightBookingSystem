const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

// Middleware to validate token with user-service
const validateToken = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Validate token with user-service
    const response = await axios.get(`${USER_SERVICE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Attach user info to request for downstream services
    req.user = {
      id: response.data.id,
      userId: response.data.id,
      userName: response.data.userName,
      role: response.data.role,
      displayName: response.data.displayName
    };

    next();
  } catch (error) {
    if (error.response?.status === 401) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ message: 'User service unavailable' });
    }
    return res.status(500).json({ message: 'Error validating token', error: error.message });
  }
};

// Middleware to check if user is admin
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'Administrator') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Middleware to check if user is passenger
const passengerOnly = (req, res, next) => {
  if (req.user?.role !== 'Passenger') {
    return res.status(403).json({ message: 'Access denied. Passenger only.' });
  }
  next();
};

module.exports = { validateToken, adminOnly, passengerOnly };
