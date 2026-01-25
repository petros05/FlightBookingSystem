const express = require('express');
const router = express.Router();

// Import route handlers
const searchFlights = require('./search');
const getFlight = require('./getFlight');
const createFlight = require('./createFlight');
const updateFlight = require('./updateFlight');
const deleteFlight = require('./deleteFlight');
const publishFlight = require('./publishFlight');
const getAllFlights = require('./getAllFlights');

// Public routes
router.get('/search', searchFlights);

// Admin routes - specific routes must come before generic :id routes
router.get('/admin/all', getAllFlights);
router.post('/', createFlight);
router.put('/:id', updateFlight);
router.delete('/:id', deleteFlight);
router.patch('/:id', publishFlight);

// Public route - must come after admin routes to avoid conflicts
router.get('/:id', getFlight);

module.exports = router;
