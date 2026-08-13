/**
 * controllers/registrationController.js — Registration business logic
 */

'use strict';

const logger = require('../utils/logger');
const Registration = require('../models/Registration');
const { validateRegistration } = require('../utils/validators');
const { buildCSV, buildExcel } = require('../utils/exporters');

/**
 * POST /api/registrations
 * Submit a new registration
 */
const submitRegistration = async (req, res) => {
  try {
    const body = req.body;
    const errors = validateRegistration(body);

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed.',
        details: errors,
      });
    }

    // Check for duplicates
    const duplicate = await Registration.findDuplicate(body.email, body.culturalProgram);
    if (duplicate) {
      return res.status(409).json({
        error: 'You have already registered for this event with this email address.',
      });
    }

    // Create and save
    const entry = await Registration.create(body);
    const saved = await Registration.add(entry);

    logger.log(
      'REG',
      `New: ${saved.fullName} <${saved.email}> — ${saved.culturalProgram}`
    );

    res.status(201).json({ success: true, id: saved._id });
  } catch (err) {
    logger.error('REG', `Submission error: ${err.message}`);
    res.status(500).json({ error: 'Failed to register. Please try again.' });
  }
};

/**
 * GET /api/registrations
 * List all registrations (admin only)
 */
const getRegistrations = async (req, res) => {
  try {
    const { company, category, event: evt, sadhya } = req.query;
    const filters = {};

    if (company) filters.company = company;
    if (category) filters.category = category;
    if (evt) filters.event = evt;
    if (sadhya) filters.sadhya = sadhya;

    const result = await Registration.getFiltered(filters);

    res.json({ count: result.length, data: result });
  } catch (err) {
    logger.error('REG', `List error: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch registrations.' });
  }
};

/**
 * DELETE /api/registrations/:id
 * Delete a registration by ID (admin only)
 */
const deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await Registration.removeById(id);

    if (!removed) {
      return res.status(404).json({ error: 'Registration not found.' });
    }

    logger.log('REG', `Deleted: ${removed.fullName} <${removed.email}>`);
    res.json({ success: true, removed });
  } catch (err) {
    logger.error('REG', `Delete error: ${err.message}`);
    res.status(500).json({ error: 'Failed to delete registration.' });
  }
};

/**
 * GET /api/stats
 * Summary stats (admin only)
 */
const getStats = async (req, res) => {
  try {
    const stats = await Registration.getStats();
    res.json(stats);
  } catch (err) {
    logger.error('STAT', `Stats error: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch statistics.' });
  }
};

/**
 * GET /api/health
 * Health check (public)
 */
const healthCheck = (req, res) => {
  res.json({
    status: 'ok',
    event: 'Ponnonam 2K26',
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/registrations/export/csv
 * Export registrations as CSV (admin only)
 */
const exportCSV = async (req, res) => {
  try {
    const registrations = await Registration.readAll();
    const csv = buildCSV(registrations);
    const date = new Date().toISOString().slice(0, 10);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ponnonam2k26_registrations_${date}.csv"`
    );
    res.send('\uFEFF' + csv);
  } catch (err) {
    logger.error('CSV', `Export error: ${err.message}`);
    res.status(500).json({ error: 'Failed to export CSV.' });
  }
};

/**
 * GET /api/registrations/export/excel
 * Export registrations as Excel (admin only)
 */
const exportExcel = async (req, res) => {
  try {
    const registrations = await Registration.readAll();
    const xlsx = buildExcel(registrations);
    const date = new Date().toISOString().slice(0, 10);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ponnonam2k26_registrations_${date}.xlsx"`
    );
    res.send(xlsx);
  } catch (err) {
    logger.error('EXCEL', `Build error: ${err.message}`);
    res.status(500).json({ error: 'Failed to generate Excel file.' });
  }
};

module.exports = {
  submitRegistration,
  getRegistrations,
  deleteRegistration,
  getStats,
  healthCheck,
  exportCSV,
  exportExcel,
};
