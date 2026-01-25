const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/flightbooking';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  // MongoDB connected
});

mongoose.connection.on('error', () => {
  // MongoDB connection error
});

// Routes
app.get('/', (req, res) => res.send('Flight Service Running'));

// Import routes
const flightsRoute = require('./src/routes/flights');
app.use('/flights', flightsRoute);

const PORT = process.env.PORT || 3002;

// Wait for MongoDB connection before starting server
const startServer = async () => {
  try {
    // Wait for connection or timeout after 10 seconds
    if (mongoose.connection.readyState === 0) {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('MongoDB connection timeout'));
        }, 10000);

        mongoose.connection.once('connected', () => {
          clearTimeout(timeout);
          resolve();
        });

        mongoose.connection.once('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });
    }

    app.listen(PORT, () => {
      // Flight Service running
    });
  } catch (error) {
    process.exit(1);
  }
};

startServer();