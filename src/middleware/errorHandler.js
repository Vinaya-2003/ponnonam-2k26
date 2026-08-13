/**
 * middleware/errorHandler.js — Express error handling middleware
 */

'use strict';

const logger = require('../utils/logger');

/**
 * Error handling middleware for Express.
 * Should be added as the last middleware in the app.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('ERROR', `${statusCode}: ${message}`);

  res.status(statusCode).json({
    error: message,
    status: statusCode,
  });
}

module.exports = errorHandler;
