/**
 * public/js/modules/countdown.js — Event countdown timer
 */

/** Target: 24 August 2026, 07:30 AM IST (UTC+5:30) */
const EVENT_DATE_IST = new Date('2026-08-24T07:30:00+05:30');

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
