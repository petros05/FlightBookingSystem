const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

// Get all passengers (admin) - delegates to user-service
const getPassengers = async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/admin/passengers`, {
      headers: { 
        Authorization: req.headers.authorization,
        'X-User-Id': req.headers['x-user-id'],
        'X-User-Role': req.headers['x-user-role']
      }
    });
    
    // Handle the response format from user-service
    // user-service returns: { success: true, count: number, passengers: [...] }
    if (response.data && response.data.success && response.data.passengers) {
      res.json(response.data.passengers);
    } else if (Array.isArray(response.data)) {
      // If it's already an array, return it directly
      res.json(response.data);
    } else {
      // Fallback: return the entire response
      res.json(response.data);
    }
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      message: error.response?.data?.message || error.message || 'Server error' 
    });
  }
};

module.exports = getPassengers;
