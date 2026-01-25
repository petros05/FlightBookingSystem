const Order = require('../models/Order');
const { getFlight } = require('../utils/flightService');
const mongoose = require('mongoose');

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.orderId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const userId = req.headers['x-user-id'] || req.user?.id || req.user?.userId;
    if (order.passenger !== userId) {
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
    if (status !== 'PAID') {
      return res.status(400).json({ message: 'Only paid orders can be cancelled' });
    }

    await order.cancel();
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = cancelOrder;
