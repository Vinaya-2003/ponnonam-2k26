/**
 * middleware/auth.js — Admin authentication middleware
 */

'use strict';

const crypto = require('crypto');
const constants = require('../config/constants');

/**
 * Middleware that checks X-Admin-Key header or ?key= query param.
 * Returns 401 if missing, 403 if wrong.
 */
function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.key || '';

  if (!key) {
    return res
      .status(401)
      .json({ error: 'Admin key required. Pass X-Admin-Key header.' });
  }

  // Constant-time comparison to prevent timing attacks
  const provided = Buffer.from(key.padEnd(64));
  const expected = Buffer.from(constants.ADMIN_KEY.padEnd(64));
  const match =
    provided.length === expected.length &&
    crypto.timingSafeEqual(provided, expected);

  if (!match) {
    return res.status(403).json({ error: 'Invalid admin key.' });
  }

  next();
}

module.exports = { requireAdmin };
