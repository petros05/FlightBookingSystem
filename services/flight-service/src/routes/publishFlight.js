const Flight = require('../models/Flight');

// Admin routes - Publish/Unpublish flight
const publishFlight = async (req, res) => {
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
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = publishFlight;
