/**
 * public/js/modules/form.js — Registration form handling
 */

let registrationSubmitted = false;

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
    form.querySelectorAll('.input-error').forEach((el) => el.classList.remove('input-error'));
    form.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
    form.querySelectorAll('[aria-invalid]').forEach((el) =>
      el.setAttribute('aria-invalid', 'false')
    );
  }
}

/**
 * Validate a single field by its input/select element ID.
 * Shows/clears inline error. Returns true if valid.
 * @param {string} fieldId
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
  } else if (fieldId === 'email') {
    const el = document.getElementById('email');
    const v = el.value.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!v) msg = 'Please enter your email address.';
    else if (!re.test(v)) msg = 'Please enter a valid email (e.g. name@domain.com).';
    setFieldState('email', msg);
    valid = !msg;
  } else if (fieldId === 'company') {
    const el = document.getElementById('company');
    if (!el.value) msg = 'Please select your company.';
    setFieldState('company', msg);
    valid = !msg;
  } else if (fieldId === 'department') {
    const el = document.getElementById('department');
    if (!el.value) msg = 'Please select your department.';
    setFieldState('department', msg);
    valid = !msg;
  } else if (fieldId === 'phone') {
    const el = document.getElementById('phone');
    const v = el.value.trim();
    const re = /^[+\d][\d\s\-()]{5,17}$/;
    if (!v) msg = 'Please enter your phone number.';
    else if (!re.test(v)) msg = 'Please enter a valid phone number.';
    setFieldState('phone', msg);
    valid = !msg;
  } else if (fieldId === 'participation-category') {
    const el = document.getElementById('participation-category');
    if (!el.value) msg = 'Please select the participation category.';
    setFieldState('participation-category', msg);
    valid = !msg;
  } else if (fieldId === 'cultural-program') {
    const el = document.getElementById('cultural-program');
    if (!el.value) msg = 'Please select your event or activity.';
    setFieldState('cultural-program', msg);
    valid = !msg;
  } else if (fieldId === 'sadhya') {
    const checked = document.querySelector('input[name="sadhya"]:checked');
    msg = checked ? '' : 'Please choose your Sadhya preference.';
    const errEl = document.getElementById('err-sadhya');
    if (errEl) errEl.textContent = msg;
    valid = !msg;
  } else if (fieldId === 'agreement') {
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
 * @param {string} errorMsg
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

/** Wire up blur validation for live feedback */
function initFormBlurValidation() {
  const blurFields = [
    'full-name',
    'email',
    'company',
    'department',
    'participation-category',
    'cultural-program',
    'phone',
  ];
  blurFields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => validateField(id));
  });

  // Radio group: validate on change
  document.querySelectorAll('input[name="sadhya"]').forEach((radio) => {
    radio.addEventListener('change', () => validateField('sadhya'));
  });

  // Checkbox: validate on change
  const agreeEl = document.getElementById('agreement');
  if (agreeEl) agreeEl.addEventListener('change', () => validateField('agreement'));
}

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

  const data = collectFormData();
  const result = await API.sendToServer(data);

  // Always save to localStorage as a fallback
  API.saveToStorage(data);

  if (result && result.duplicate) {
    if (btn) btn.disabled = false;
    if (btnText) btnText.textContent = 'Confirm Registration';
    if (spinner) spinner.setAttribute('hidden', '');
    const errEl = document.getElementById('err-email');
    if (errEl) errEl.textContent = result.message || 'You have already registered for this event.';
    const emailEl = document.getElementById('email');
    if (emailEl) {
      emailEl.classList.add('input-error');
      emailEl.focus();
    }
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
