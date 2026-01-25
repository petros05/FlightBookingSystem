const Flight = require('../models/Flight');
const { body, validationResult } = require('express-validator');

// Admin routes - Create flight (auth validated by gateway)
const createFlight = [
  body('flightNumber').notEmpty().withMessage('Flight number is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('origin').notEmpty().withMessage('Origin is required'),
  body('destination').notEmpty().withMessage('Destination is required'),
  body('departureTime').notEmpty().withMessage('Departure time is required'),
  body('arrivalTime').notEmpty().withMessage('Arrival time is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const flight = new Flight(req.body);
      await flight.save();
      res.status(201).json(flight);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
];

module.exports = createFlight;
