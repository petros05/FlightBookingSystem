const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const Order = require('../models/Order');
const { authMiddleware, adminOnly, passengerOnly } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get available flights (public)
router.get('/search', async (req, res) => {
  try {
    const { city, flightNumber, date } = req.query;
    let query = {
      isPublished: true,
      isDeleted: false,
      departureTime: { $gte: new Date() }
    };

    if (city) {
      query.$or = [
        { origin: { $regex: city, $options: 'i' } },
        { destination: { $regex: city, $options: 'i' } }
      ];
    }

    if (flightNumber) {
      query.flightNumber = { $regex: flightNumber, $options: 'i' };
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.departureTime = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const flights = await Flight.find(query).sort({ departureTime: 1 });

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
        remainingSeats: flight.capacity - ordersCount
      };
    }));

    res.json(flightsWithSeats);
  } catch (error) {
    console.error('Search flights error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get flight by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const flight = await Flight.findOne({ id: req.params.id, isDeleted: false });
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    const ordersCount = await Order.countDocuments({
      flight: flight._id,
      isCancelled: false
    });

    res.json({
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
    });
  } catch (error) {
    console.error('Get flight error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes - Create flight
router.post('/', [authMiddleware, adminOnly, [
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
    res.status(201).json(flight);
  } catch (error) {
    console.error('Create flight error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes - Update flight
router.put('/:id', [authMiddleware, adminOnly], async (req, res) => {
  try {
    const flight = await Flight.findOne({ id: req.params.id, isDeleted: false });
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    Object.assign(flight, req.body);
    await flight.save();
    res.json(flight);
  } catch (error) {
    console.error('Update flight error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes - Delete flight
router.delete('/:id', [authMiddleware, adminOnly], async (req, res) => {
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

// Admin routes - Publish flight
router.post('/:id/publish', [authMiddleware, adminOnly], async (req, res) => {
  try {
    const flight = await Flight.findOne({ id: req.params.id, isDeleted: false });
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    await flight.publish();
    res.json({ message: 'Flight published successfully' });
  } catch (error) {
    console.error('Publish flight error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes - Get all flights
router.get('/admin/all', [authMiddleware, adminOnly], async (req, res) => {
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

module.exports = router;
