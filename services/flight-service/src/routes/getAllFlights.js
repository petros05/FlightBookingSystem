const Flight = require('../models/Flight');
const Order = require('../models/Order');

// Admin routes - Get all flights (including unpublished)
const getAllFlights = async (req, res) => {
  try {
    const flights = await Flight.find({ isDeleted: false }).sort({ createdAt: -1 });
    
    const flightsList = await Promise.all(flights.map(async (flight) => {
      const ordersCount = await Order.countDocuments({
        flight: flight._id,
        isCancelled: false
      });
      return {
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
      };
    }));
    
    res.json(flightsList);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getAllFlights;
