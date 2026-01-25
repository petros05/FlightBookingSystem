const Order = require('../models/Order');
const { getFlight } = require('../utils/flightService');

// Get all orders for current passenger
const getPassengerOrders = async (req, res) => {
  try {
    // Get user ID from header (set by API gateway) or from req.user
    const userId = req.headers['x-user-id'] || req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const orders = await Order.find({ 
      passenger: userId 
    }).sort({ createdTime: -1 });

    // Get flight details from flight-service for each order
    const ordersWithStatus = await Promise.all(orders.map(async (order) => {
      let flightData = null;
      try {
        // Get flight ObjectId from order - we need to find the flight by _id
        // Since we store ObjectId, we need to get flight details differently
        // For now, we'll need to store flightId (UUID) in orders or get it from flight-service
        // This is a limitation - we'll need to update the Order model
        const mongoose = require('mongoose');
        const db = mongoose.connection.db;
        const flightDoc = await db.collection('flights').findOne({ _id: order.flight });
        if (flightDoc && flightDoc.id) {
          flightData = await getFlight(flightDoc.id);
        }
      } catch (error) {
        // Error fetching flight - continue without flight data
      }

      const status = await order.getStatus(flightData);
      const price = await order.getPrice(flightData);

      return {
        id: order.id,
        flight: flightData ? {
          id: flightData.id,
          flightNumber: flightData.flightNumber,
          origin: flightData.origin,
          destination: flightData.destination,
          departureTime: flightData.departureTime,
          arrivalTime: flightData.arrivalTime
        } : null,
        seat: order.seat,
        createdTime: order.createdTime,
        status,
        price,
        isPaid: order.isPaid,
        isCancelled: order.isCancelled
      };
    }));

    res.json(ordersWithStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = getPassengerOrders;
