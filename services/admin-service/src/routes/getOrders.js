const axios = require('axios');

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3003';

// Get all orders (admin)
const getOrders = async (req, res) => {
  try {
    const response = await axios.get(`${BOOKING_SERVICE_URL}/orders/admin/all`, {
      headers: { 
        Authorization: req.headers.authorization,
        'X-User-Id': req.headers['x-user-id'],
        'X-User-Role': req.headers['x-user-role']
      }
    });
    
    // Fetch user details for each order
    const orders = response.data;
    const ordersWithUsers = await Promise.all(orders.map(async (order) => {
      try {
        // Note: In a real system, you'd batch these requests or use a user lookup service
        // For now, we'll just return the passenger UUID
        return order;
      } catch (err) {
        return order;
      }
    }));
    
    res.json(ordersWithUsers);
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      message: error.response?.data?.message || error.message || 'Server error' 
    });
  }
};

module.exports = getOrders;
