const express = require('express');
const router = express.Router();

// Import route handlers
const getPassengerOrders = require('./getPassengerOrders');
const createOrder = require('./createOrder');
const getOrder = require('./getOrder');
const payOrder = require('./payOrder');
const cancelOrder = require('./cancelOrder');
const getAvailableSeats = require('./getAvailableSeats');
const getAllOrders = require('./getAllOrders');

// Route definitions - specific routes must come before generic :id route
router.get('/passenger', getPassengerOrders);
router.get('/admin/all', getAllOrders);
router.get('/flight/:flightId/seats', getAvailableSeats);
router.post('/', createOrder);
router.patch('/:orderId/pay', payOrder);
router.patch('/:orderId/cancel', cancelOrder);
router.get('/:id', getOrder);

module.exports = router;
