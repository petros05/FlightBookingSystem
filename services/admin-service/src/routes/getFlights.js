const axios = require('axios');

const FLIGHT_SERVICE_URL = process.env.FLIGHT_SERVICE_URL || 'http://localhost:3002';

// Get all flights (admin)
const getFlights = async (req, res) => {
  try {
    const response = await axios.get(`${FLIGHT_SERVICE_URL}/flights/admin/all`, {
      headers: { 
        Authorization: req.headers.authorization,
        'X-User-Id': req.headers['x-user-id'],
        'X-User-Role': req.headers['x-user-role']
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      message: error.response?.data?.message || error.message || 'Server error' 
    });
  }
};

module.exports = getFlights;
