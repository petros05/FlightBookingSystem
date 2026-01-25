const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const { validateToken, adminOnly, passengerOnly } = require('./middleware/auth');

const app = express();

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins (or specify your frontend URL)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging middleware removed for production

// Service URLs - use environment variables or defaults
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const FLIGHT_SERVICE_URL = process.env.FLIGHT_SERVICE_URL || 'http://localhost:3002';
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3003';
const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL || 'http://localhost:3004';

// Helper function to create proxy with body handling
const createProxy = (target, pathRewrite = {}) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    onProxyReq: (proxyReq, req, res) => {
      // Set user headers first (before body handling)
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.id);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
      
      // Handle body for POST/PUT/PATCH requests
      // When express.json() parses the body, it consumes the stream
      // So we need to manually write it to the proxy request
      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        const contentLength = Buffer.byteLength(bodyData);
        
        // Set content headers
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', contentLength);
        
        // Remove chunked encoding if present
        proxyReq.removeHeader('Transfer-Encoding');
        
        // Write body - the middleware will handle ending the request
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => {
      if (!res.headersSent) {
        res.status(500).json({ message: 'Proxy error', error: err.message });
      }
    }
  });
};

// Auth routes (no auth required)
app.use('/api/auth', createProxy(USER_SERVICE_URL, {
  '^/api/auth': ''
}));

// Flight routes - Public GET routes (must be before admin routes)
app.get('/api/flights/search', createProxy(FLIGHT_SERVICE_URL, {
  '^/api/flights': '/flights'
}));
app.get('/api/flights/:id', createProxy(FLIGHT_SERVICE_URL, {
  '^/api/flights': '/flights'
}));

// Flight routes - Admin GET route for all flights
app.get('/api/flights/admin/all', validateToken, adminOnly, createProxy(FLIGHT_SERVICE_URL, {
  '^/api/flights': '/flights'
}));

// Flight routes - Admin write operations (POST, PUT, DELETE, PATCH)
app.post('/api/flights', validateToken, adminOnly, createProxy(FLIGHT_SERVICE_URL, {
  '^/api/flights': '/flights'
}));
app.put('/api/flights/:id', validateToken, adminOnly, createProxy(FLIGHT_SERVICE_URL, {
  '^/api/flights': '/flights'
}));
app.patch('/api/flights/:id', validateToken, adminOnly, createProxy(FLIGHT_SERVICE_URL, {
  '^/api/flights': '/flights'
}));
app.delete('/api/flights/:id', validateToken, adminOnly, createProxy(FLIGHT_SERVICE_URL, {
  '^/api/flights': '/flights'
}));

// Order routes - Public route for getting available seats (no auth required)
app.get('/api/orders/flight/:flightId/seats', createProxy(BOOKING_SERVICE_URL, {
  '^/api/orders': '/orders'
}));

// Order routes - All other routes require authentication
app.use('/api/orders', validateToken, createProxy(BOOKING_SERVICE_URL, {
  '^/api/orders': '/orders'
}));

// Admin routes - All require admin
app.use('/api/admin', validateToken, adminOnly, createProxy(ADMIN_SERVICE_URL, {
  '^/api/admin': '/admin'
}));

app.get('/', (req, res) => res.send('API Gateway Running'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Gateway is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // API Gateway running
});