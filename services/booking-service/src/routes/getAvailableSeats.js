const Order = require('../models/Order');
const { getFlight } = require('../utils/flightService');
const mongoose = require('mongoose');

// Get available seats for a flight
const getAvailableSeats = async (req, res) => {
  try {
    const flightId = req.params.flightId;
    
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    // Get flight from flight-service (not from database)
    const flight = await getFlight(flightId);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Get flight's MongoDB _id to query orders
    const db = mongoose.connection.db;
    const flightDoc = await db.collection('flights').findOne({ id: flightId });
    if (!flightDoc) {
      return res.status(404).json({ message: 'Flight document not found in database' });
    }

    // Get all orders for this flight
    const orders = await Order.find({
      flight: flightDoc._id,
      isCancelled: false
    });

    const takenSeats = orders.map(order => order.seat).filter(seat => seat != null);
    const availableSeats = [];

    for (let i = 1; i <= flight.capacity; i++) {
      if (!takenSeats.includes(i)) {
        availableSeats.push(i);
      }
    }

    res.json({
      availableSeats,
      takenSeats,
      totalSeats: flight.capacity
    });
  } catch (error) {
    // More detailed error logging for debugging
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({ 
      message: 'Server error', 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = getAvailableSeats;
