const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3003';

// Admin book flight for passenger
const bookFlight = async (req, res) => {
  try {
    const { flightId, seat, identityCardNumber, displayName } = req.body;

    if (!flightId || !identityCardNumber || !displayName) {
      return res.status(400).json({ 
        message: 'Flight ID, identity card number, and display name are required' 
      });
    }

    let passengerId;

    // Step 1: Check if user exists by identity card number
    try {
      const findResponse = await axios.get(
        `${USER_SERVICE_URL}/find-by-identity/${identityCardNumber}`,
        {
          headers: { 
            Authorization: req.headers.authorization,
            'X-User-Id': req.headers['x-user-id'],
            'X-User-Role': req.headers['x-user-role']
          }
        }
      );

      if (findResponse.data && findResponse.data.success && findResponse.data.user) {
        // User exists, use their ID
        passengerId = findResponse.data.user.id;
      }
    } catch (findError) {
      // User not found (404) - we'll register them
      if (findError.response?.status !== 404) {
        throw findError; // Re-throw if it's not a 404
      }
    }

    // Step 2: If user doesn't exist, register them
    if (!passengerId) {
      try {
        const registerResponse = await axios.post(
          `${USER_SERVICE_URL}/register-by-admin`,
          {
            identityCardNumber,
            displayName
          },
          {
            headers: { 
              Authorization: req.headers.authorization,
              'X-User-Id': req.headers['x-user-id'],
              'X-User-Role': req.headers['x-user-role']
            }
          }
        );

        if (registerResponse.data && registerResponse.data.success && registerResponse.data.user) {
          passengerId = registerResponse.data.user.id;
        } else {
          return res.status(500).json({ message: 'Failed to register user' });
        }
      } catch (registerError) {
        return res.status(registerError.response?.status || 500).json({ 
          message: registerError.response?.data?.message || 'Failed to register user' 
        });
      }
    }

    // Step 3: Book the flight for the passenger
    try {
      const bookingResponse = await axios.post(
        `${BOOKING_SERVICE_URL}/orders`,
        {
          flightId,
          seat
        },
        {
          headers: { 
            Authorization: req.headers.authorization,
            'X-User-Id': passengerId, // Use passenger ID, not admin ID
            'X-User-Role': 'Passenger' // Set role as Passenger for booking
          }
        }
      );

      res.status(201).json({
        success: true,
        message: 'Flight booked successfully',
        order: bookingResponse.data,
        passengerId: passengerId
      });
    } catch (bookingError) {
      return res.status(bookingError.response?.status || 500).json({ 
        message: bookingError.response?.data?.message || 'Failed to book flight' 
      });
    }
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      message: error.response?.data?.message || error.message || 'Server error' 
    });
  }
};

module.exports = bookFlight;
