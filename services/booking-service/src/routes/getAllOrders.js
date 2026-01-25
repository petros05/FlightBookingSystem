const Order = require('../models/Order');
const { getFlight } = require('../utils/flightService');
const mongoose = require('mongoose');

// Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    // Verify admin role
    const userRole = req.headers['x-user-role'] || req.user?.role;
    if (userRole !== 'Administrator') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const orders = await Order.find({}).sort({ createdTime: -1 });

    // Get flight details from flight-service for each order
    const ordersWithStatus = await Promise.all(orders.map(async (order) => {
      let flightData = null;
      try {
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
        passenger: order.passenger, // UUID string
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

module.exports = getAllOrders;
