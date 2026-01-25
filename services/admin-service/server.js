const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('Admin Service Running'));

// Import routes
const adminRoute = require('./src/routes/admin');
app.use('/admin', adminRoute);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  // Admin Service running
});