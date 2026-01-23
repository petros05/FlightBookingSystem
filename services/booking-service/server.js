const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bookingdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.get('/', (req, res) => res.send('Booking Service Running'));

// Booking routes (placeholder)
app.get('/orders', (req, res) => res.send('Get orders'));
app.post('/orders', (req, res) => res.send('Create order'));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Booking Service running on port ${PORT}`));