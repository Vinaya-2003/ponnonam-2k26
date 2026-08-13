/**
 * public/js/utils/api.js — API communication utilities
 */

const API = {
  /**
   * Get stored registrations from localStorage.
   * @returns {Array}
   */
  getStoredRegistrations() {
    try {
      return JSON.parse(localStorage.getItem('ponnonam2k26_registrations') || '[]');
    } catch {
      return [];
    }
  },

  /**
   * Save registration to localStorage.
   * @param {object} data
   */
  saveToStorage(data) {
    const regs = this.getStoredRegistrations();
    regs.push(data);
    try {
      localStorage.setItem('ponnonam2k26_registrations', JSON.stringify(regs));
    } catch (err) {
      console.error('Failed to save registration:', err);
    }
  },

  /**
   * Get registrations from server or localStorage.
   * @returns {Promise<Array>}
   */
  async getRegistrations() {
    const localData = this.getStoredRegistrations();

    if (window.location.protocol !== 'file:') {
      const key = sessionStorage.getItem('admin_key') || '';
      try {
        const response = await fetch('/api/registrations', {
          headers: { 'X-Admin-Key': key },
        });
        if (response.ok) {
          const json = await response.json();
          const serverData = Array.isArray(json) ? json : (json.data || []);
          return serverData;
        }
      } catch (err) {
        // Server unavailable, fall back to local storage.
      }
    }

    return localData;
  },

  /**
   * Send registration to server.
   * @param {object} data
   * @returns {Promise<object>}
   */
  async sendToServer(data) {
    if (window.location.protocol === 'file:') {
      return { ok: false, offline: true };
    }

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
  },

  /**
   * Export CSV from server.
   */
  exportCSV() {
    const key = sessionStorage.getItem('admin_key') || '';
    const url = `/api/registrations/export/csv?key=${encodeURIComponent(key)}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Export Excel from server.
   */
  exportExcel() {
    const key = sessionStorage.getItem('admin_key') || '';
    const url = `/api/registrations/export/excel?key=${encodeURIComponent(key)}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
