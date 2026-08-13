/**
 * utils/validators.js — Validation functions for registration data
 */

'use strict';

const constants = require('../config/constants');

/**
 * Sanitise a string field — trim and strip HTML tags.
 * @param {string} val - The value to sanitize
 * @returns {string}
 */
function sanitise(val) {
  return String(val || '').trim().replace(/<[^>]*>/g, '');
}

/**
 * Validate a complete registration object.
 * @param {object} body - The registration data from request
 * @returns {Array<string>} Array of error messages, empty if valid
 */
function validateRegistration(body) {
  const errors = [];

  // Full name validation
  if (!body.fullName || sanitise(body.fullName).length < 2) {
    errors.push('fullName: must be at least 2 characters.');
  }

  // Email validation
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!body.email || !emailRe.test(sanitise(body.email))) {
    errors.push('email: must be a valid email address.');
  }

  // Company validation
  if (!body.company || !constants.VALID_COMPANIES.includes(sanitise(body.company))) {
    errors.push(`company: must be one of: ${constants.VALID_COMPANIES.join(', ')}.`);
  }

  // Department validation
  if (
    !body.department ||
    !constants.VALID_DEPARTMENTS.includes(sanitise(body.department))
  ) {
    errors.push(
      `department: must be one of: ${constants.VALID_DEPARTMENTS.join(', ')}.`
    );
  }

  // Participation category validation
  if (
    !body.participationCategory ||
    !constants.VALID_CATEGORIES.includes(sanitise(body.participationCategory))
  ) {
    errors.push(
      `participationCategory: must be one of: ${constants.VALID_CATEGORIES.join(', ')}.`
    );
  }

  // Cultural program validation
  if (!body.culturalProgram || !constants.VALID_EVENTS.includes(sanitise(body.culturalProgram))) {
    errors.push('culturalProgram: must be a valid event/activity.');
  }

  // Phone validation
  const phoneRe = /^[+\d][\d\s\-()\\.]{5,18}$/;
  if (!body.phone || !phoneRe.test(sanitise(body.phone))) {
    errors.push('phone: must be a valid phone number.');
  }

  // Sadhya validation
  if (!body.sadhya || !constants.VALID_SADHYA.includes(sanitise(body.sadhya))) {
    errors.push(`sadhya: must be one of: ${constants.VALID_SADHYA.join(', ')}.`);
  }

  return errors;
}

module.exports = {
  sanitise,
  validateRegistration,
};
