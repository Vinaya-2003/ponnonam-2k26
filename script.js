/**
 * script.js — Ponnonam 2K26
 * All behavior: page navigation, countdown, form validation/submit, admin panel, CSV export.
 * Organized into clearly commented function groups.
 */

'use strict';

/* ============================================================
   CONSTANTS
   ============================================================ */

/** Target: 24 August 2026, 07:30 AM IST (UTC+5:30) */
const EVENT_DATE_IST = new Date('2026-08-24T07:30:00+05:30');

/** localStorage key for registration data */
const STORAGE_KEY = 'ponnonam2k26_registrations';

/** Admin passcode — share this only with the organizing team */
const ADMIN_PASSCODE = 'ponnonam2k26';

/** Available views */
const VIEWS = ['home', 'events', 'registration'];

/** Track whether registration success is currently shown */
let registrationSubmitted = false;


/* ============================================================
   PAGE NAVIGATION
   ============================================================ */

/**
 * Show the given view and hide all others.
 * Updates nav link active states and scrolls to top.
 * @param {string} viewId - One of 'home', 'events', 'registration'
 */
function showView(viewId) {
  if (!VIEWS.includes(viewId)) return;

  // Show / hide sections
  VIEWS.forEach(id => {
    const section = document.getElementById('view-' + id);
    if (!section) return;
    if (id === viewId) {
      section.classList.add('active');
      section.removeAttribute('hidden');
    } else {
      section.classList.remove('active');
      section.setAttribute('hidden', '');
    }
  });

  // Reset registration form when navigating to registration view
  if (viewId === 'registration') {
    resetRegistrationView();
  }

  // Update nav link active/aria-current
  document.querySelectorAll('.nav-link').forEach(btn => {
    const isActive = btn.dataset.view === viewId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-current', isActive ? 'page' : 'false');
  });

  // Close mobile nav menu if open
  closeMobileNav();

  // Scroll to top of content
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** Open / close the mobile hamburger menu */
function toggleMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const isOpen = navLinks.classList.contains('open');

  navLinks.classList.toggle('open', !isOpen);
  toggle.setAttribute('aria-expanded', String(!isOpen));
}

function closeMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  navLinks.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}

/** Wire up all navigation event listeners */
function initNavigation() {
  // Nav link buttons
  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.addEventListener('click', () => showView(btn.dataset.view));
  });

  // Brand button → Home
  const brandBtn = document.getElementById('nav-brand-btn');
  if (brandBtn) brandBtn.addEventListener('click', () => showView('home'));

  // Hamburger toggle
  const toggleBtn = document.getElementById('nav-toggle');
  if (toggleBtn) toggleBtn.addEventListener('click', toggleMobileNav);

  // Hero CTA buttons
  document.getElementById('btn-view-program')?.addEventListener('click', () => showView('events'));
  document.getElementById('btn-register')?.addEventListener('click', () => showView('registration'));

  // Close mobile nav when clicking outside
  document.addEventListener('click', e => {
    const nav = document.getElementById('main-nav');
    if (nav && !nav.contains(e.target)) closeMobileNav();
  });
}

/** Handle hash-based routing (#admin) on page load and hash change */
function initHashRouting() {
  function handleHash() {
    if (window.location.hash === '#admin') {
      showAdminPanel();
    } else {
      hideAdminPanel();
    }
  }
  window.addEventListener('hashchange', handleHash);
  handleHash(); // Run on initial load
}


/* ============================================================
   COUNTDOWN
   ============================================================ */

/** Zero-pad a number to at least 2 digits */
function pad(n) {
  return String(n).padStart(2, '0');
}

/** Update the countdown display once */
function updateCountdown() {
  const now = new Date();
  const diff = EVENT_DATE_IST - now;

  const cdD = document.getElementById('cd-d');
  const cdH = document.getElementById('cd-h');
  const cdM = document.getElementById('cd-m');
  const cdS = document.getElementById('cd-s');

  if (!cdD) return;

  if (diff <= 0) {
    // Event has started or passed
    cdD.textContent = '00';
    cdH.textContent = '00';
    cdM.textContent = '00';
    cdS.textContent = '00';
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  cdD.textContent = pad(days);
  cdH.textContent = pad(hours);
  cdM.textContent = pad(minutes);
  cdS.textContent = pad(seconds);
}

/** Start the countdown ticker */
function initCountdown() {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}


/* ============================================================
   FORM VALIDATION
   ============================================================ */

/**
 * Reset the registration view back to the form (hide success card).
 */
function resetRegistrationView() {
  const formWrap = document.getElementById('reg-form-wrap');
  const successEl = document.getElementById('reg-success');
  const form = document.getElementById('registration-form');

  if (formWrap) formWrap.style.display = '';
  if (successEl) {
    successEl.setAttribute('hidden', '');
    successEl.style.display = '';
  }
  if (form) {
    form.reset();
    // Clear all inline errors
    form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    form.querySelectorAll('[aria-invalid]').forEach(el => el.setAttribute('aria-invalid', 'false'));
  }
}

/**
 * Validate a single field by its input/select element ID.
 * Shows/clears inline error. Returns true if valid.
 * @param {string} fieldId - The id of the input, select, or radio group container.
 * @returns {boolean}
 */
function validateField(fieldId) {
  let valid = true;
  let msg = '';

  if (fieldId === 'full-name') {
    const el = document.getElementById('full-name');
    const v = el.value.trim();
    if (!v) msg = 'Please enter your full name.';
    else if (v.length < 2) msg = 'Name must be at least 2 characters.';
    setFieldState('full-name', msg);
    valid = !msg;
  }

  else if (fieldId === 'email') {
    const el = document.getElementById('email');
    const v = el.value.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!v) msg = 'Please enter your email address.';
    else if (!re.test(v)) msg = 'Please enter a valid email (e.g. name@domain.com).';
    setFieldState('email', msg);
    valid = !msg;
  }

  else if (fieldId === 'company') {
    const el = document.getElementById('company');
    if (!el.value) msg = 'Please select your company.';
    setFieldState('company', msg);
    valid = !msg;
  }

  else if (fieldId === 'department') {
    const el = document.getElementById('department');
    if (!el.value) msg = 'Please select your department.';
    setFieldState('department', msg);
    valid = !msg;
  }

  else if (fieldId === 'phone') {
    const el = document.getElementById('phone');
    const v = el.value.trim();
    // Allow digits, spaces, +, -, (), 7–15 chars total
    const re = /^[+\d][\d\s\-()]{5,17}$/;
    if (!v) msg = 'Please enter your phone number.';
    else if (!re.test(v)) msg = 'Please enter a valid phone number.';
    setFieldState('phone', msg);
    valid = !msg;
  }

  else if (fieldId === 'participation-category') {
    const el = document.getElementById('participation-category');
    if (!el.value) msg = 'Please select the participation category.';
    setFieldState('participation-category', msg);
    valid = !msg;
  }

  else if (fieldId === 'cultural-program') {
    const el = document.getElementById('cultural-program');
    if (!el.value) msg = 'Please select your event or activity.';
    setFieldState('cultural-program', msg);
    valid = !msg;
  }

  else if (fieldId === 'sadhya') {
    const checked = document.querySelector('input[name="sadhya"]:checked');
    msg = checked ? '' : 'Please choose your Sadhya preference.';
    const errEl = document.getElementById('err-sadhya');
    if (errEl) errEl.textContent = msg;
    valid = !msg;
  }

  else if (fieldId === 'agreement') {
    const el = document.getElementById('agreement');
    msg = el.checked ? '' : 'Please confirm your attendance.';
    const errEl = document.getElementById('err-agreement');
    if (errEl) errEl.textContent = msg;
    valid = !msg;
  }

  return valid;
}

/**
 * Set visual error/valid state on a field and its error span.
 * @param {string} fieldId
 * @param {string} errorMsg - Empty string means valid.
 */
function setFieldState(fieldId, errorMsg) {
  const el = document.getElementById(fieldId);
  const errEl = document.getElementById('err-' + fieldId);

  if (!el) return;

  if (errorMsg) {
    el.classList.add('input-error');
    el.setAttribute('aria-invalid', 'true');
  } else {
    el.classList.remove('input-error');
    el.setAttribute('aria-invalid', 'false');
  }

  if (errEl) errEl.textContent = errorMsg;
}

/** Validate all form fields. Returns true only if every field is valid. */
function validateForm() {
  const results = [
    validateField('full-name'),
    validateField('email'),
    validateField('company'),
    validateField('department'),
    validateField('participation-category'),
    validateField('cultural-program'),
    validateField('phone'),
    validateField('sadhya'),
    validateField('agreement'),
  ];
  return results.every(Boolean);
}

/** Wire up blur validation for live feedback as user fills in the form */
function initFormBlurValidation() {
  const blurFields = ['full-name', 'email', 'company', 'department', 'participation-category', 'cultural-program', 'phone'];
  blurFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => validateField(id));
  });

  // Radio group: validate on change
  document.querySelectorAll('input[name="sadhya"]').forEach(radio => {
    radio.addEventListener('change', () => validateField('sadhya'));
  });

  // Checkbox: validate on change
  const agreeEl = document.getElementById('agreement');
  if (agreeEl) agreeEl.addEventListener('change', () => validateField('agreement'));
}


/* ============================================================
   FORM SUBMIT
   ============================================================ */

/**
 * Collect form values and return a plain registration object.
 * @returns {object}
 */
function collectFormData() {
  const sadhyaEl = document.querySelector('input[name="sadhya"]:checked');
  return {
    fullName: document.getElementById('full-name').value.trim(),
    email: document.getElementById('email').value.trim(),
    company: document.getElementById('company').value,
    department: document.getElementById('department').value,
    participationCategory: document.getElementById('participation-category').value,
    culturalProgram: document.getElementById('cultural-program').value,
    phone: document.getElementById('phone').value.trim(),
    sadhya: sadhyaEl ? sadhyaEl.value : '',
    timestamp: new Date().toISOString(),
  };
}

/** Show the success state and hide the form */
function showRegistrationSuccess() {
  const formWrap = document.getElementById('reg-form-wrap');
  const successEl = document.getElementById('reg-success');

  if (formWrap) formWrap.style.display = 'none';
  if (successEl) {
    successEl.removeAttribute('hidden');
    successEl.style.display = 'flex';
    successEl.focus?.();
  }
  registrationSubmitted = true;
}

/**
 * Handle form submit event: validate → send to server → store → show success.
 * @param {Event} e
 */
async function handleFormSubmit(e) {
  e.preventDefault();

  if (!validateForm()) {
    // Focus the first invalid field
    const firstErr = document.querySelector('.input-error, [aria-invalid="true"]');
    if (firstErr) firstErr.focus();
    return;
  }

  // Loading state
  const btn = document.getElementById('submit-btn');
  const btnText = document.getElementById('submit-btn-text');
  const spinner = document.getElementById('submit-spinner');

  if (btn) btn.disabled = true;
  if (btnText) btnText.textContent = 'Registering…';
  if (spinner) spinner.removeAttribute('hidden');

  const data   = collectFormData();
  const result = await sendRegistrationToServer(data);

  // Always save to localStorage as a fallback
  saveRegistration(data);

  if (result && result.duplicate) {
    // Re-enable form and show inline error
    if (btn) btn.disabled = false;
    if (btnText) btnText.textContent = 'Confirm Registration';
    if (spinner) spinner.setAttribute('hidden', '');
    const errEl = document.getElementById('err-email');
    if (errEl) errEl.textContent = result.message || 'You have already registered for this event.';
    const emailEl = document.getElementById('email');
    if (emailEl) { emailEl.classList.add('input-error'); emailEl.focus(); }
    return;
  }

  showRegistrationSuccess();
}

/** Wire up the registration form */
function initRegistrationForm() {
  const form = document.getElementById('registration-form');
  if (form) form.addEventListener('submit', handleFormSubmit);
  initFormBlurValidation();
}


/* ============================================================
   DATA STORAGE (localStorage)
   ============================================================ */

/**
 * Get all stored registrations.
 * @returns {Array<object>}
 */
function getStoredRegistrations() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

async function getRegistrations() {
  const localData = getStoredRegistrations();

  if (window.location.protocol !== 'file:') {
    const key = sessionStorage.getItem('admin_key') || '';
    try {
      const response = await fetch('/api/registrations', {
        headers: { 'X-Admin-Key': key },
      });
      if (response.ok) {
        const json = await response.json();
        // New API returns { count, data: [...] }
        const serverData = Array.isArray(json) ? json : (json.data || []);
        return serverData;
      }
    } catch (err) {
      // Server unavailable, fall back to local storage.
    }
  }

  return localData;
}

/**
 * Append a new registration to localStorage.
 * @param {object} data
 */
function saveRegistration(data) {
  const regs = getStoredRegistrations();
  regs.push(data);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(regs));
  } catch (err) {
    console.error('Failed to save registration:', err);
  }
}

async function sendRegistrationToServer(data) {
  if (window.location.protocol === 'file:') return { ok: false, offline: true };

  try {
    const response = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.status === 409) {
      const json = await response.json();
      return { ok: false, duplicate: true, message: json.error };
    }

    if (!response.ok) {
      const text = await response.text();
      console.warn('Server registration failed:', response.status, text);
      return { ok: false };
    }

    return { ok: true };
  } catch (err) {
    console.warn('Server API not reachable, saved locally:', err);
    return { ok: false, offline: true };
  }
}


/* ============================================================
   ADMIN PANEL
   ============================================================ */

/** Show the entire admin panel, hide main site UI */
function showAdminPanel() {
  const adminEl = document.getElementById('admin-panel');
  const mainNav = document.getElementById('main-nav');
  const mainCont = document.getElementById('main-content');
  const footer = document.getElementById('main-footer');

  if (adminEl) adminEl.removeAttribute('hidden');
  if (mainNav) mainNav.setAttribute('hidden', '');
  if (mainCont) mainCont.setAttribute('hidden', '');
  if (footer) footer.setAttribute('hidden', '');

  // Always start at the gate unless already unlocked this session
  const isUnlocked = sessionStorage.getItem('admin_unlocked') === '1';
  if (isUnlocked) {
    showAdminData();
  } else {
    document.getElementById('admin-gate')?.removeAttribute('hidden');
    document.getElementById('admin-data')?.setAttribute('hidden', '');
  }
}

/** Hide the admin panel, restore main site UI */
function hideAdminPanel() {
  const adminEl = document.getElementById('admin-panel');
  const mainNav = document.getElementById('main-nav');
  const mainCont = document.getElementById('main-content');
  const footer = document.getElementById('main-footer');

  if (adminEl) adminEl.setAttribute('hidden', '');
  if (mainNav) mainNav.removeAttribute('hidden');
  if (mainCont) mainCont.removeAttribute('hidden');
  if (footer) footer.removeAttribute('hidden');
}

/** Show the data view once authenticated */
function showAdminData() {
  document.getElementById('admin-gate')?.setAttribute('hidden', '');
  const dataEl = document.getElementById('admin-data');
  if (dataEl) dataEl.removeAttribute('hidden');
  renderAdminTable();
}

/** Validate admin passcode and proceed if correct */
function handleAdminLogin() {
  const input = document.getElementById('admin-passcode');
  const errEl = document.getElementById('err-admin-passcode');

  if (!input) return;
  const entered = input.value;

  if (entered === ADMIN_PASSCODE) {
    sessionStorage.setItem('admin_unlocked', '1');
    // Store the key for API calls when running under Node.js
    sessionStorage.setItem('admin_key', entered);
    if (errEl) errEl.textContent = '';
    input.value = '';
    showAdminData();
  } else {
    if (errEl) errEl.textContent = 'Incorrect passcode. Please try again.';
    input.value = '';
    input.focus();
    // Brief shake animation
    input.classList.add('input-error');
    setTimeout(() => input.classList.remove('input-error'), 800);
  }
}

/** Log out of admin, return to login gate */
function handleAdminLogout() {
  sessionStorage.removeItem('admin_unlocked');
  sessionStorage.removeItem('admin_key');
  document.getElementById('admin-data')?.setAttribute('hidden', '');
  document.getElementById('admin-gate')?.removeAttribute('hidden');
  const input = document.getElementById('admin-passcode');
  if (input) input.value = '';
}

/** Go back to the main site from admin */
function handleAdminBack() {
  window.location.hash = '';
  hideAdminPanel();
  showView('home');
}

/**
 * Render the registrations table with fresh data from localStorage.
 */
async function renderAdminTable() {
  const regs = await getRegistrations();
  const tbody = document.getElementById('admin-table-body');
  const countEl = document.getElementById('admin-reg-count');
  const emptyMsgEl = document.getElementById('admin-empty-msg');

  if (!tbody) return;

  // Update count
  if (countEl) {
    countEl.textContent = regs.length === 1
      ? '1 registration'
      : regs.length + ' registrations';
  }

  if (regs.length === 0) {
    tbody.innerHTML = '';
    if (emptyMsgEl) emptyMsgEl.removeAttribute('hidden');
    return;
  }

  if (emptyMsgEl) emptyMsgEl.setAttribute('hidden', '');

  tbody.innerHTML = regs.map((r, i) => {
    const ts = r.timestamp
      ? new Date(r.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      : '\u2014';

    return `<tr>
      <td>${i + 1}</td>
      <td>${escHtml(r.fullName || '')}</td>
      <td>${escHtml(r.email || '')}</td>
      <td>${escHtml(r.company || '')}</td>
      <td>${escHtml(r.department || '')}</td>
      <td>${escHtml(r.participationCategory || '')}</td>
      <td>${escHtml(r.culturalProgram || '')}</td>
      <td>${escHtml(r.phone || '')}</td>
      <td>${escHtml(r.sadhya || '')}</td>
      <td>${escHtml(ts)}</td>
    </tr>`;
  }).join('');
}

/** Escape HTML special characters to prevent XSS in table output */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Wire up all admin panel event listeners */
function initAdminPanel() {
  // Login button
  document.getElementById('admin-login-btn')?.addEventListener('click', handleAdminLogin);

  // Allow Enter key in passcode input
  document.getElementById('admin-passcode')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleAdminLogin();
  });

  // Logout
  document.getElementById('admin-logout-btn')?.addEventListener('click', handleAdminLogout);

  // Back to site
  document.getElementById('admin-back-btn')?.addEventListener('click', handleAdminBack);

  // CSV export
  document.getElementById('csv-export-btn')?.addEventListener('click', exportCSV);

  // Excel export
  document.getElementById('excel-export-btn')?.addEventListener('click', exportExcel);
}


/* ============================================================
   CSV EXPORT
   ============================================================ */

/**
 * Export registrations as CSV.
 * When running under Node.js, downloads from the server-side endpoint.
 * Falls back to client-side generation when opened as a local file.
 */
async function exportCSV() {
  if (window.location.protocol !== 'file:') {
    // Server-side export
    const key = sessionStorage.getItem('admin_key') || '';
    const url = `/api/registrations/export/csv?key=${encodeURIComponent(key)}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Client-side fallback (file:// mode)
  const regs = await getRegistrations();
  const headers = ['#', 'Full Name', 'Email', 'Company', 'Department', 'Participation Category', 'Event / Activity', 'Phone', 'Sadhya Preference', 'Registered At'];
  const rows = regs.map((r, i) => {
    const ts = r.timestamp
      ? new Date(r.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      : '';
    return [
      i + 1,
      r.fullName || '',
      r.email || '',
      r.company || '',
      r.department || '',
      r.participationCategory || '',
      r.culturalProgram || '',
      r.phone || '',
      r.sadhya || '',
      ts,
    ];
  });
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ponnonam2k26_registrations_' + new Date().toISOString().slice(0, 10) + '.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}


/* ============================================================
   EXCEL EXPORT
   ============================================================ */

/**
 * Export the stored registrations as a .xlsx Excel file.
 * When running under Node.js, downloads from the server-side endpoint (no extra library needed).
 * Falls back to client-side xlsx library when opened as a local file.
 */
async function exportExcel() {
  if (window.location.protocol !== 'file:') {
    // Server-side export
    const key = sessionStorage.getItem('admin_key') || '';
    const url = `/api/registrations/export/excel?key=${encodeURIComponent(key)}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Client-side fallback (file:// mode)
  if (typeof XLSX === 'undefined') {
    alert('Excel export library is not loaded. Please check your internet connection and try again.');
    return;
  }

  const regs = await getRegistrations();
  const wsData = [
    ['#', 'Full Name', 'Email', 'Company', 'Department', 'Participation Category', 'Event / Activity', 'Phone', 'Sadhya Preference', 'Registered At'],
    ...regs.map((r, i) => [
      i + 1,
      r.fullName || '',
      r.email || '',
      r.company || '',
      r.department || '',
      r.participationCategory || '',
      r.culturalProgram || '',
      r.phone || '',
      r.sadhya || '',
      r.timestamp ? new Date(r.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '',
    ]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 4 }, { wch: 22 }, { wch: 28 }, { wch: 14 }, { wch: 14 },
    { wch: 22 }, { wch: 24 }, { wch: 16 }, { wch: 16 }, { wch: 22 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
  XLSX.writeFile(wb, 'ponnonam2k26_registrations_' + new Date().toISOString().slice(0, 10) + '.xlsx');
}


/* ============================================================
   INITIALISATION
   ============================================================ */

/** Bootstrap the application once the DOM is ready */
function init() {
  initNavigation();
  initCountdown();
  initRegistrationForm();
  initAdminPanel();
  initHashRouting();
}

// Run after DOM is fully parsed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
