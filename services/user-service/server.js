const express = require('express');
const cors = require('cors');
const sequelize = require('./src/config/database');
const User = require('./src/models/User');
const { ensureDatabaseExists } = require('./src/utils/db-init');
const { initAdmin } = require('./src/utils/init-admin');
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const app = express();
app.use(cors());
app.use(express.json());

// Initialize database and admin user on startup
(async () => {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    
    // Initialize admin user if it doesn't exist
    const adminResult = await initAdmin();
    if (adminResult.created) {
      // Only log in development or if explicitly enabled
      if (process.env.NODE_ENV !== 'production' || process.env.LOG_ADMIN_CREATION === 'true') {
        // Admin created - credentials logged only in dev or when explicitly enabled
      }
    }
  } catch (error) {
    // Database connection will be retried
  }
})();


// Routes
app.get('/', (req, res) => res.send('User Service Running'));

// Import routes
const registerRoute = require('./src/routes/register');
const loginRoute = require('./src/routes/login');
const forgetPasswordRoute = require('./src/routes/forgetPassword');
const getAllUsersRoute = require('./src/routes/getAllUsers');
const meRoute = require('./src/routes/me');
const findByIdentityCardRoute = require('./src/routes/findByIdentityCard');
const registerByAdminRoute = require('./src/routes/registerByAdmin');
const createAdminRoute = require('./src/routes/createAdmin');

app.use('/register', registerRoute);
app.use('/login', loginRoute);
app.use('/forget-password', forgetPasswordRoute);
app.use('/admin/passengers', getAllUsersRoute);
app.use('/me', meRoute);
app.use('/find-by-identity', findByIdentityCardRoute);
app.use('/register-by-admin', registerByAdminRoute);
app.use('/create-admin', createAdminRoute);

app.listen(PORT, () => {
  // User service running
})