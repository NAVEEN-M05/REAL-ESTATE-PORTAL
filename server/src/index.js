const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDB } = require('./config/db');
const { seedData } = require('./services/seedService');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount API routes
app.use('/api', apiRoutes);

// Root Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    system: 'Smart Campus Resource & Energy Management System Backend',
    version: '1.0.0',
    endpoints: {
      metrics: '/api/energy/metrics',
      rooms: '/api/rooms',
      devices: '/api/devices',
      bookings: '/api/bookings',
      alerts: '/api/alerts',
      reports: '/api/reports/energy'
    }
  });
});

// Startup sequence
async function startServer() {
  try {
    // 1. Initialize Database (Postgres or seamless in-memory fallback)
    await initDB();

    // 2. Seed initial realistic dataset
    await seedData();

    // 3. Start Express HTTP Server
    app.listen(PORT, () => {
      console.log(`\n🚀 [Server] Smart Campus Backend running on http://localhost:${PORT}`);
      console.log(`📡 [API Base] http://localhost:${PORT}/api\n`);
    });
  } catch (err) {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  }
}

startServer();
