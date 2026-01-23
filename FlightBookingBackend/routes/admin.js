const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middleware/auth');
const Order = require('../models/Order');
const Flight = require('../models/Flight');
const { Passenger, Administrator } = require('../models/User');
const { body, validationResult } = require('express-validator');

// Get all flights (admin)
router.get('/flights', [authMiddleware, adminOnly], async (req, res) => {
  try {
    const flights = await Flight.find({ isDeleted: false }).sort({ createdAt: -1 });
    
    // Calculate remaining seats for each flight
    const flightsWithSeats = await Promise.all(flights.map(async (flight) => {
      const ordersCount = await Order.countDocuments({
        flight: flight._id,
        isCancelled: false
      });
      return {
        id: flight.id,
        flightNumber: flight.flightNumber,
        price: flight.price,
        origin: flight.origin,
        destination: flight.destination,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        capacity: flight.capacity,
        remainingSeats: flight.capacity - ordersCount,
        isPublished: flight.isPublished
      };
    }));
    
    res.json(flightsWithSeats);
  } catch (error) {
    console.error('Get all flights error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create flight (admin)
router.post('/flights', [authMiddleware, adminOnly, [
  body('flightNumber').notEmpty().withMessage('Flight number is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('origin').notEmpty().withMessage('Origin is required'),
  body('destination').notEmpty().withMessage('Destination is required'),
  body('departureTime').notEmpty().withMessage('Departure time is required'),
  body('arrivalTime').notEmpty().withMessage('Arrival time is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer')
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const flight = new Flight(req.body);
    await flight.save();
    res.status(201).json({
      id: flight.id,
      flightNumber: flight.flightNumber,
      price: flight.price,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      capacity: flight.capacity,
      isPublished: flight.isPublished
    });
  } catch (error) {
    console.error('Create flight error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update flight (admin)
router.put('/flights/:id', [authMiddleware, adminOnly], async (req, res) => {
  try {
    const flight = await Flight.findOne({ id: req.params.id, isDeleted: false });
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    Object.assign(flight, req.body);
    await flight.save();
    res.json({
      id: flight.id,
      flightNumber: flight.flightNumber,
      price: flight.price,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      capacity: flight.capacity,
      isPublished: flight.isPublished
    });
  } catch (error) {
    console.error('Update flight error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete flight (admin)
router.delete('/flights/:id', [authMiddleware, adminOnly], async (req, res) => {
  try {
    const flight = await Flight.findOne({ id: req.params.id });
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    flight.delete();
    res.json({ message: 'Flight deleted successfully' });
  } catch (error) {
    console.error('Delete flight error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle publish flight (admin)
router.patch('/flights/:id', [authMiddleware, adminOnly], async (req, res) => {
  try {
    const flight = await Flight.findOne({ id: req.params.id, isDeleted: false });
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    if (req.body.isPublished !== undefined) {
      flight.isPublished = req.body.isPublished;
      await flight.save();
    }
    
    res.json({
      id: flight.id,
      flightNumber: flight.flightNumber,
      price: flight.price,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      capacity: flight.capacity,
      isPublished: flight.isPublished
    });
  } catch (error) {
    console.error('Update flight error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders (admin)
router.get('/orders', [authMiddleware, adminOnly], async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('flight')
      .populate('passenger')
      .sort({ createdTime: -1 });

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
      };
    }));

    res.json(ordersWithStatus);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all passengers (admin)
router.get('/passengers', [authMiddleware, adminOnly], async (req, res) => {
  try {
    const passengers = await Passenger.find({}).select('-passwordHash');
    res.json(passengers);
  } catch (error) {
    console.error('Get passengers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all administrators (admin)
router.get('/administrators', [authMiddleware, adminOnly], async (req, res) => {
  try {
    const admins = await Administrator.find({}).select('-passwordHash');
    res.json(admins);
  } catch (error) {
    console.error('Get administrators error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create administrator (admin)
router.post('/administrators', [authMiddleware, adminOnly, [
  body('userName').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userName, password } = req.body;

    // Check if username exists
    const existingUser = await Administrator.findOne({ userName });
    if (existingUser) {
      return res.status(400).json({ message: 'User name already exists.' });
    }

    const admin = new Administrator({
      userName,
      role: 'Administrator'
    });
    admin.setPassword(password);
    await admin.save();

    res.status(201).json({
      id: admin.id,
      userName: admin.userName,
      role: admin.role
    });
  } catch (error) {
    console.error('Create administrator error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update passenger (admin)
router.put('/passengers/:id', [authMiddleware, adminOnly], async (req, res) => {
  try {
    const passenger = await Passenger.findOne({ id: req.params.id });
    if (!passenger) {
      return res.status(404).json({ message: 'Passenger not found' });
    }

    const { displayName, identityCardNumber } = req.body;
    if (displayName) passenger.displayName = displayName;
    if (identityCardNumber) passenger.identityCardNumber = identityCardNumber;

    await passenger.save();
    res.json({
      id: passenger.id,
      userName: passenger.userName,
      displayName: passenger.displayName,
      identityCardNumber: passenger.identityCardNumber
    });
  } catch (error) {
    console.error('Update passenger error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Find user by identity card number (admin)
router.get('/passengers/by-identity/:identityNumber', [authMiddleware, adminOnly], async (req, res) => {
  try {
    const passenger = await Passenger.findOne({ identityCardNumber: req.params.identityNumber });
    if (!passenger) {
      return res.status(404).json({ message: 'Passenger not found' });
    }
    res.json({
      id: passenger.id,
      userName: passenger.userName,
      displayName: passenger.displayName,
      identityCardNumber: passenger.identityCardNumber
    });
  } catch (error) {
    console.error('Find passenger by identity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register passenger with identity card as password (admin)
router.post('/passengers/register', [authMiddleware, adminOnly, [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('identityCardNumber').notEmpty().withMessage('Identity card number is required')
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, identityCardNumber } = req.body;
    const displayName = `${firstName} ${lastName}`;
    
    // Generate username from identity card number
    let userName = `user_${identityCardNumber}`;

    // Check if identity card already exists
    const existingPassenger = await Passenger.findOne({ identityCardNumber });
    if (existingPassenger) {
      return res.status(400).json({ message: 'ID card is already registered.' });
    }

    // Check if username exists (unlikely but check anyway)
    const existingUser = await Passenger.findOne({ userName });
    if (existingUser) {
      // If username exists, append a number
      let counter = 1;
      let newUserName = `${userName}_${counter}`;
      while (await Passenger.findOne({ userName: newUserName })) {
        counter++;
        newUserName = `${userName}_${counter}`;
      }
      userName = newUserName;
    }

    // Create new passenger with identity card as password
    const passenger = new Passenger({
      userName,
      displayName,
      identityCardNumber,
      role: 'Passenger'
    });
    passenger.setPassword(identityCardNumber);
    await passenger.save();

    res.status(201).json({
      id: passenger.id,
      userName: passenger.userName,
      displayName: passenger.displayName,
      identityCardNumber: passenger.identityCardNumber
    });
  } catch (error) {
    console.error('Register passenger error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
