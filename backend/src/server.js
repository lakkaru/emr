require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./utils/db');
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const auditRoutes = require('./routes/audits');
const allergyRoutes = require('./routes/allergies');
const medicationRoutes = require('./routes/medications');

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false // adjust per frontend domains
}));

// CORS with allowlist
const allowed = (process.env.ALLOWED_ORIGINS || 'http://localhost:8000').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS')); 
  },
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Logging (avoid logging PHI payloads in production)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limit
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use('/api/', apiLimiter);

// Health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/allergies', allergyRoutes);
app.use('/api/medications', medicationRoutes);

// Error handler (generic; avoid leaking details)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const code = err.status || 500;
  res.status(code).json({ error: code === 500 ? 'Server error' : err.message });
});

const port = process.env.PORT || 4000;
connectDB(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => console.log(`API listening on :${port}`));
  })
  .catch((e) => {
    console.error('DB connection failed', e);
    process.exit(1);
  });
