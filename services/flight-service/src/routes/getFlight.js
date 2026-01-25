const Flight = require('../models/Flight');
const Order = require('../models/Order');

// Get flight by ID (public)
const getFlight = async (req, res) => {
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
      _id: flight._id,
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getFlight;
