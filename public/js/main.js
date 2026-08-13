/**
 * public/js/main.js — Application entry point and initialization
 */

'use strict';

/**
 * Initialize all modules and set up the application.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize navigation
  initNavigation();
  initHashRouting();

  // Initialize countdown timer
  initCountdown();

  // Initialize registration form
  initRegistrationForm();

  // Initialize admin panel
  initAdminPanel();

  // Show home view by default
  showView('home');
});
