const express = require('express');
const router = express.Router();

// Import route handlers
const getFlights = require('./getFlights');
const getOrders = require('./getOrders');
const getPassengers = require('./getPassengers');
const bookFlight = require('./bookFlight');

// Route definitions
router.get('/flights', getFlights);
router.get('/orders', getOrders);
router.get('/passengers', getPassengers);
router.post('/book-flight', bookFlight);

module.exports = router;
