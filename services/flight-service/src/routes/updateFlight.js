const Flight = require('../models/Flight');

// Admin routes - Update flight
const updateFlight = async (req, res) => {
  try {
    const flight = await Flight.findOne({ id: req.params.id, isDeleted: false });
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    Object.assign(flight, req.body);
    await flight.save();
    res.json(flight);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = updateFlight;
