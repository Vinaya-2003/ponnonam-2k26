/**
 * public/js/modules/navigation.js — Page navigation and view management
 */

const VIEWS = ['home', 'events', 'registration'];

/**
 * Show the given view and hide all others.
 * Updates nav link active states and scrolls to top.
 * @param {string} viewId
 */
function showView(viewId) {
  if (!VIEWS.includes(viewId)) return;

  // Show / hide sections
  VIEWS.forEach((id) => {
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
  document.querySelectorAll('.nav-link').forEach((btn) => {
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
  document.querySelectorAll('.nav-link').forEach((btn) => {
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
  document.addEventListener('click', (e) => {
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
