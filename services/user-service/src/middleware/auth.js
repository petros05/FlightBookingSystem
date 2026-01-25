const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'Administrator') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

const passengerOnly = (req, res, next) => {
  if (req.user.role !== 'Passenger') {
    return res.status(403).json({ message: 'Access denied. Passenger only.' });
  }
  next();
};

module.exports = { authMiddleware, adminOnly, passengerOnly };