/**
 * utils/logger.js — Simple logging utility
 */

'use strict';

const logger = {
  log: (tag, message) => console.log(`[${tag}] ${message}`),
  error: (tag, message) => console.error(`[${tag}] ${message}`),
  warn: (tag, message) => console.warn(`[${tag}] ${message}`),
  info: (tag, message) => console.log(`[${tag}] ${message}`),
};

module.exports = logger;
