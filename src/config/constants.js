/**
 * config/constants.js — Configuration constants and validation rules
 */

'use strict';

module.exports = {
  // Server
  PORT: process.env.PORT || 3000,
  ADMIN_KEY: process.env.ADMIN_KEY || 'ponnonam2k26-admin',

  // Data
  DATA_DIR: process.env.DATA_DIR || './.data',
  DATA_FILE_NAME: 'registrations.json',

  // Validation rules
  VALID_COMPANIES: ['COZMEK', 'Disha Mentor', 'BSI', 'BBC', 'YMBC'],
  VALID_DEPARTMENTS: [
    'HR',
    'Operations',
    'AI',
    'Cyber',
    'Cloud',
    'Marketing',
    'Accounts',
    'Administration',
    'Other',
  ],
  VALID_CATEGORIES: ['Cultural Performance', 'Games Activity', 'Both'],
  VALID_EVENTS: [
    'Thiruvathira',
    'Onam Song',
    'Dance',
    'Song',
    'Fashion Show',
    'Kasera Kali',
    'Chakkil Ottam',
    'Kuppiyil Velam Nirakal',
    'Lemon Spoon Race',
    'Rotti Kadi',
    'Oori Adi',
    'Vadam Vali',
    'Onam Pookalam',
    'Not Participating in Events',
  ],
  VALID_SADHYA: ['Vegetarian', 'Non-Vegetarian'],

  // CSV Export
  CSV_HEADERS: [
    '#',
    'Full Name',
    'Email',
    'Company',
    'Department',
    'Participation Category',
    'Event / Activity',
    'Phone',
    'Sadhya Preference',
    'Registered At',
  ],

  // Event info
  EVENT_DATE_IST: '2026-08-24T07:30:00+05:30',
  EVENT_NAME: 'Ponnonam 2K26',
};
