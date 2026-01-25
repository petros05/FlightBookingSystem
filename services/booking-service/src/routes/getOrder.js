const Order = require('../models/Order');
const { getFlight } = require('../utils/flightService');
const mongoose = require('mongoose');

// Get order by ID
const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    const userId = req.headers['x-user-id'] || req.user?.id || req.user?.userId;
    const userRole = req.headers['x-user-role'] || req.user?.role;
    
    if (order.passenger !== userId && userRole !== 'Administrator') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get flight details from flight-service
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

    res.json({
      id: order.id,
      flight: flightData ? {
        id: flightData.id,
        flightNumber: flightData.flightNumber,
        origin: flightData.origin,
        destination: flightData.destination,
        departureTime: flightData.departureTime,
        arrivalTime: flightData.arrivalTime,
        price: flightData.price
      } : null,
      seat: order.seat,
      createdTime: order.createdTime,
      status,
      price,
      isPaid: order.isPaid,
      isCancelled: order.isCancelled
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = getOrder;
