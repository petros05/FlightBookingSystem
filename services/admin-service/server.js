const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/admindb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.get('/', (req, res) => res.send('Admin Service Running'));

// Admin routes (placeholder)
app.get('/admin/flights', (req, res) => res.send('Manage flights'));
app.get('/admin/orders', (req, res) => res.send('Manage orders'));

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Admin Service running on port ${PORT}`));