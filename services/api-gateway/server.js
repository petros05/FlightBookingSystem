const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Proxy routes to services
app.use('/api/auth', createProxyMiddleware({ target: 'http://localhost:3001', changeOrigin: true }));
app.use('/api/flights', createProxyMiddleware({ target: 'http://localhost:3002', changeOrigin: true }));
app.use('/api/orders', createProxyMiddleware({ target: 'http://localhost:3003', changeOrigin: true }));
app.use('/api/admin', createProxyMiddleware({ target: 'http://localhost:3004', changeOrigin: true }));

app.get('/', (req, res) => res.send('API Gateway Running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));