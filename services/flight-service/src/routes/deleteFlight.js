const Flight = require('../models/Flight');

// Admin routes - Delete flight
const deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findOne({ id: req.params.id });
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    flight.delete();
    res.json({ message: 'Flight deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = deleteFlight;
