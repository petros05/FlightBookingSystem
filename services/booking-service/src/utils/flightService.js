const axios = require('axios');

const FLIGHT_SERVICE_URL = process.env.FLIGHT_SERVICE_URL || 'http://localhost:3002';

// Helper function to get flight from flight-service
const getFlight = async (flightId) => {
  try {
    const url = `${FLIGHT_SERVICE_URL}/flights/${flightId}`;
    const response = await axios.get(url, {
      timeout: 5000 // 5 second timeout
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    // Log connection errors for debugging
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error(`Cannot connect to flight-service at ${FLIGHT_SERVICE_URL}. Please check FLIGHT_SERVICE_URL environment variable.`);
    }
    throw error;
  }
};

module.exports = { getFlight };
