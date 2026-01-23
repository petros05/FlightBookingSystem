const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Flight = require('../models/Flight');
const { authMiddleware, passengerOnly, adminOnly } = require('../middleware/auth');
const { Passenger } = require('../models/User');
const { body, validationResult } = require('express-validator');

// Get all orders for current passenger
router.get('/passenger', [authMiddleware, passengerOnly], async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;
    const orders = await Order.find({ 
      passenger: userId 
    }).populate('flight').sort({ createdTime: -1 });

    const ordersWithStatus = await Promise.all(orders.map(async (order) => {
      const status = await order.getStatus();
      const price = await order.getPrice();
      return {
        id: order.id,
        flight: {
          id: order.flight.id,
          flightNumber: order.flight.flightNumber,
          origin: order.flight.origin,
          destination: order.flight.destination,
          departureTime: order.flight.departureTime,
          arrivalTime: order.flight.arrivalTime
        },
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
    console.error('Get passenger orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create order (book flight)
router.post('/', [authMiddleware, passengerOnly, [
  body('flightId').notEmpty().withMessage('Flight ID is required'),
  body('seat').optional().isInt({ min: 1 }).withMessage('Seat must be a positive integer')
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { flightId, seat } = req.body;
    const userId = req.user._id || req.user.userId;

    // Find flight by id (UUID)
    const flight = await Flight.findOne({ id: flightId, isDeleted: false });
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    if (!flight.isPublished || flight.departureTime < new Date()) {
      return res.status(400).json({ message: 'Flight is not available for booking' });
    }

    // Check capacity
    const ordersCount = await Order.countDocuments({
      flight: flight._id,
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
        flight: flight._id,
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
        flight: flight._id,
        seat: assignedSeat,
        isCancelled: false
      });

      if (existingOrder) {
        return res.status(400).json({ message: 'Seat not available.' });
      }
    }

    // Create order
    const order = new Order({
      flight: flight._id,
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
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id })
      .populate('flight')
      .populate('passenger');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    const userId = req.user._id || req.user.userId;
    if (order.passenger._id.toString() !== userId.toString() && req.user.role !== 'Administrator') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const status = await order.getStatus();
    const price = await order.getPrice();

    res.json({
      id: order.id,
      flight: {
        id: order.flight.id,
        flightNumber: order.flight.flightNumber,
        origin: order.flight.origin,
        destination: order.flight.destination,
        departureTime: order.flight.departureTime,
        arrivalTime: order.flight.arrivalTime,
        price: order.flight.price
      },
      passenger: {
        id: order.passenger.id,
        userName: order.passenger.userName,
        displayName: order.passenger.displayName || null
      },
      seat: order.seat,
      createdTime: order.createdTime,
      status,
      price,
      isPaid: order.isPaid,
      isCancelled: order.isCancelled
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Pay for order
router.post('/:id/pay', [authMiddleware, passengerOnly], async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id }).populate('flight');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const userId = req.user._id || req.user.userId;
    if (order.passenger.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const status = await order.getStatus();
    if (status !== 'UNPAID') {
      return res.status(400).json({ message: 'Order cannot be paid. Status: ' + status });
    }

    await order.pay();
    res.json({ message: 'Order paid successfully' });
  } catch (error) {
    console.error('Pay order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel order
router.post('/:id/cancel', [authMiddleware, passengerOnly], async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id }).populate('flight');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const userId = req.user._id || req.user.userId;
    if (order.passenger.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const status = await order.getStatus();
    if (status !== 'PAID') {
      return res.status(400).json({ message: 'Only paid orders can be cancelled' });
    }

    await order.cancel();
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available seats for a flight
router.get('/flight/:flightId/seats', async (req, res) => {
  try {
    const flight = await Flight.findOne({ id: req.params.flightId, isDeleted: false });
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    const orders = await Order.find({
      flight: flight._id,
      isCancelled: false
    });

    const takenSeats = orders.map(order => order.seat);
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
    console.error('Get available seats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Create order for any passenger
router.post('/admin', [authMiddleware, adminOnly, [
  body('flightId').notEmpty().withMessage('Flight ID is required'),
  body('passengerId').notEmpty().withMessage('Passenger ID is required'),
  body('seat').isInt({ min: 1 }).withMessage('Seat must be a positive integer')
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { flightId, passengerId, seat } = req.body;

    // Find flight by id (UUID)
    const flight = await Flight.findOne({ id: flightId, isDeleted: false });
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Find passenger by id (UUID)
    const passenger = await Passenger.findOne({ id: passengerId });
    if (!passenger) {
      return res.status(404).json({ message: 'Passenger not found' });
    }

    // Check if seat is already taken
    const existingOrder = await Order.findOne({
      flight: flight._id,
      seat,
      isCancelled: false
    });

    if (existingOrder) {
      return res.status(400).json({ message: 'Seat not available.' });
    }

    // Check capacity
    const ordersCount = await Order.countDocuments({
      flight: flight._id,
      isCancelled: false
    });

    if (ordersCount >= flight.capacity) {
      return res.status(400).json({ message: 'Flight is fully booked' });
    }

    // Create order
    const order = new Order({
      flight: flight._id,
      passenger: passenger._id,
      seat
    });
    await order.save();

    res.status(201).json({ 
      id: order.id,
      message: 'Order created successfully',
      orderId: order.id
    });
  } catch (error) {
    console.error('Admin create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
