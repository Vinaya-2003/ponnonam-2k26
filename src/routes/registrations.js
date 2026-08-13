/**
 * routes/registrations.js — Registration API routes
 */

'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/registrationController');
const { requireAdmin } = require('../middleware/auth');

// Public routes
router.post('/', controller.submitRegistration);
router.get('/health', controller.healthCheck);

// Admin-only routes
router.get('/', requireAdmin, controller.getRegistrations);
router.get('/stats', requireAdmin, controller.getStats);
router.get('/export/csv', requireAdmin, controller.exportCSV);
router.get('/export/excel', requireAdmin, controller.exportExcel);
router.delete('/:id', requireAdmin, controller.deleteRegistration);

module.exports = router;
