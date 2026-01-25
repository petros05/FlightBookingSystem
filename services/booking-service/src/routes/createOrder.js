const Order = require('../models/Order');
const { body, validationResult } = require('express-validator');
const { getFlight } = require('../utils/flightService');
const mongoose = require('mongoose');

// Create order (book flight)
const createOrder = [
  body('flightId').notEmpty().withMessage('Flight ID is required'),
  body('seat').optional().isInt({ min: 1 }).withMessage('Seat must be a positive integer'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Get user ID from header (set by API gateway) or from req.user
      const userId = req.headers['x-user-id'] || req.headers['X-User-Id'] || req.user?.id || req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { flightId, seat } = req.body;

      // Get flight from flight-service (not from database)
      const flight = await getFlight(flightId);
      if (!flight) {
        return res.status(404).json({ message: 'Flight not found' });
      }

      if (!flight.isPublished || new Date(flight.departureTime) < new Date()) {
        return res.status(400).json({ message: 'Flight is not available for booking' });
      }

      // Get flight's MongoDB _id to store in order
      const db = mongoose.connection.db;
      const flightDoc = await db.collection('flights').findOne({ id: flightId });
      if (!flightDoc) {
        return res.status(404).json({ message: 'Flight document not found in database' });
      }

      // Check capacity by counting orders
      const ordersCount = await Order.countDocuments({
        flight: flightDoc._id,
        isCancelled: false
      });

      if (ordersCount >= flight.capacity) {
        return res.status(400).json({ message: 'Flight is fully booked' });
      }

      // Auto-assign seat if not provided
      let assignedSeat = seat;
      if (!assignedSeat) {
        // Find the next available seat number
        const takenSeats = await Order.find({
          flight: flightDoc._id,
          isCancelled: false
        }).select('seat');
        const takenSeatNumbers = new Set(takenSeats.map(o => o.seat));
        
        // Find first available seat from 1 to capacity
        for (let i = 1; i <= flight.capacity; i++) {
          if (!takenSeatNumbers.has(i)) {
            assignedSeat = i;
            break;
          }
        }
        
        if (!assignedSeat) {
          return res.status(400).json({ message: 'No available seats' });
        }
      } else {
        // Validate seat number is within capacity
        if (assignedSeat > flight.capacity || assignedSeat < 1) {
          return res.status(400).json({ message: 'Invalid seat number.' });
        }

        // Check if provided seat is already taken
        const existingOrder = await Order.findOne({
          flight: flightDoc._id,
          seat: assignedSeat,
          isCancelled: false
        });

        if (existingOrder) {
          return res.status(400).json({ message: 'Seat not available.' });
        }
      }

      // Create order with flight ObjectId
      const order = new Order({
        flight: flightDoc._id,
        passenger: userId,
        seat: assignedSeat
      });
      await order.save();

      res.status(201).json({ 
        id: order.id,
        message: 'Order created successfully',
        orderId: order.id
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
];

module.exports = createOrder;
