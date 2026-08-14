/**
 * src/server.js — Ponnonam 2K26 Backend API Server
 *
 * Start: node src/server.js
 * Or: npm start
 * Or with custom port: PORT=4000 node src/server.js
 */

'use strict';

require('dotenv').config();

const express = require('express');
const path = require('path');
const constants = require('./config/constants');
const logger = require('./utils/logger');
const registrationsRouter = require('./routes/registrations');
const errorHandler = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');

/* ============================================================
   APP SETUP
   ============================================================ */

const app = express();
const PORT = constants.PORT;

// Parse JSON bodies
app.use(express.json());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// CORS — allow same origin + any localhost origin for dev
app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  const allowed = /^https?:\/\/localhost(:\d+)?$/.test(origin) || !origin;
  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Serve the public directory (static files)
app.use(express.static(path.join(__dirname, '../public')));

/* ============================================================
   API ROUTES
   ============================================================ */

// Mount registration routes
app.use('/api/registrations', registrationsRouter);

// Health check at root
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    event: constants.EVENT_NAME,
    timestamp: new Date().toISOString(),
  });
});

// Fallback for SPA: serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

/* ============================================================
   ERROR HANDLING
   ============================================================ */

app.use(errorHandler);

/* ============================================================
   START SERVER
   ============================================================ */

async function startServer() {
  // Connect to MongoDB
  await connectDB();

  app.listen(PORT, '0.0.0.0',() => {
    logger.log('SERVER', '');
    logger.log('SERVER', '╔══════════════════════════════════════════╗');
    logger.log('SERVER', '║      Ponnonam 2K26 — Backend Server      ║');
    logger.log('SERVER', '╠══════════════════════════════════════════╣');
    logger.log('SERVER', `║  Site   → http://localhost:${PORT.toString().padEnd(16)} ║`);
    logger.log('SERVER', `║  API    → http://localhost:${PORT.toString().padEnd(15)} ║`);
    logger.log(
      'SERVER',
      '║  Admin key in ADMIN_KEY env variable     ║'
    );
    logger.log('SERVER', '║  Database: MongoDB (Mongoose)            ║');
    logger.log('SERVER', '╚══════════════════════════════════════════╝');
    logger.log('SERVER', '');
  });
}

startServer().catch((err) => {
  logger.error('SERVER', `Startup error: ${err.message}`);
  process.exit(1);
});

module.exports = app;
