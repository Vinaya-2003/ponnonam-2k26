/**
 * public/js/modules/admin.js — Admin panel functionality
 */

const ADMIN_PASSCODE = 'ponnonam2k26';

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
    sessionStorage.setItem('admin_key', entered);
    if (errEl) errEl.textContent = '';
    input.value = '';
    showAdminData();
  } else {
    if (errEl) errEl.textContent = 'Incorrect passcode. Please try again.';
    input.value = '';
    input.focus();
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

/** Escape HTML special characters */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Render the registrations table with fresh data.
 */
async function renderAdminTable() {
  const regs = await API.getRegistrations();
  const tbody = document.getElementById('admin-table-body');
  const countEl = document.getElementById('admin-reg-count');
  const emptyMsgEl = document.getElementById('admin-empty-msg');

  if (!tbody) return;

  if (countEl) {
    countEl.textContent =
      regs.length === 1 ? '1 registration' : regs.length + ' registrations';
  }

  if (regs.length === 0) {
    tbody.innerHTML = '';
    if (emptyMsgEl) emptyMsgEl.removeAttribute('hidden');
    return;
  }

  if (emptyMsgEl) emptyMsgEl.setAttribute('hidden', '');

  tbody.innerHTML = regs
    .map((r, i) => {
      const ts = r.timestamp
        ? new Date(r.timestamp).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })
        : '—';

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
    })
    .join('');
}

/** Wire up all admin panel event listeners */
function initAdminPanel() {
  document.getElementById('admin-login-btn')?.addEventListener('click', handleAdminLogin);

  document.getElementById('admin-passcode')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAdminLogin();
  });

  document.getElementById('admin-logout-btn')?.addEventListener('click', handleAdminLogout);
  document.getElementById('admin-back-btn')?.addEventListener('click', handleAdminBack);
  document.getElementById('csv-export-btn')?.addEventListener('click', () => API.exportCSV());
  document.getElementById('excel-export-btn')?.addEventListener('click', () => API.exportExcel());
}
