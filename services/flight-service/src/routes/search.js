const Flight = require('../models/Flight');
const Order = require('../models/Order');

// Get available flights (public)
const searchFlights = async (req, res) => {
  try {
    const { city, flightNumber, date } = req.query;
    let query = {
      isPublished: true,
      isDeleted: false
    };

    // Only filter by future departure time if no specific date is provided
    if (!date) {
      query.departureTime = { $gte: new Date() };
    }

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
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.departureTime = {
        $gte: startDate,
        $lte: endDate
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = searchFlights;
