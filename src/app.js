require('./config/env');

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const ridesRoutes = require('./routes/ridesRoutes');
const bookingsRoutes = require('./routes/bookingsRoutes');
const carsRoutes = require('./routes/carsRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// ============ MIDDLEWARE ============
app.use(cors());
app.use(express.json());

// ============ ROUTES ============
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/rides', ridesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/cars', carsRoutes);

// ============ FALLBACKS ============
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-unused-vars
  const _next = next;
  console.error('❌ Unhandled error:', err?.message || err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
