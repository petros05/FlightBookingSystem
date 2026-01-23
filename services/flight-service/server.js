const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/flightdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.get('/', (req, res) => res.send('Flight Service Running'));

// Flight routes (placeholder)
app.get('/flights', (req, res) => res.send('Get flights'));
app.post('/flights', (req, res) => res.send('Add flight'));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Flight Service running on port ${PORT}`));