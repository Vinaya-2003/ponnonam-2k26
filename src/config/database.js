/**
 * config/database.js — MongoDB connection configuration
 */

'use strict';

const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB database
 */
async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    logger.warn('DB', 'MONGO_URI not set. Skipping MongoDB connection.');
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('DB', 'Connected to MongoDB successfully');
    return true;
  } catch (err) {
    logger.error('DB', `Connection failed: ${err.message}`);
    return false;
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDB() {
  try {
    await mongoose.disconnect();
    logger.info('DB', 'Disconnected from MongoDB');
  } catch (err) {
    logger.error('DB', `Disconnect error: ${err.message}`);
  }
}

module.exports = {
  connectDB,
  disconnectDB,
};
