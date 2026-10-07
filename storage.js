/**
 * WhatsApp Privacy Shield - Storage Manager
 * Handles persistent configuration using chrome.storage.sync with fallback to chrome.storage.local.
 */

class WAPrivacyStorage {
  constructor() {
    this.storageKey = WA_PRIVACY_CONSTANTS.STORAGE_KEY;
    this.defaults = WA_PRIVACY_CONSTANTS.DEFAULT_SETTINGS;
  }

  /**
   * Determine available storage area
   */
  get storageArea() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return chrome.storage.sync || chrome.storage.local;
    }
    return null;
  }

  /**
   * Fetch current settings, safely merging with defaults
   * @returns {Promise<Object>}
   */
  async getSettings() {
    return new Promise((resolve) => {
      const area = this.storageArea;
      if (!area) {
        resolve({ ...this.defaults });
        return;
      }

      area.get([this.storageKey], (result) => {
        if (chrome.runtime && chrome.runtime.lastError) {
          console.warn('[WhatsApp Privacy] Storage get error:', chrome.runtime.lastError.message);
          resolve({ ...this.defaults });
          return;
        }

        const stored = result ? result[this.storageKey] : null;
        if (!stored || typeof stored !== 'object') {
          resolve({ ...this.defaults });
          return;
        }

        // Deep merge defaults with stored settings to preserve new fields across versions
        const merged = { ...this.defaults, ...stored };
        resolve(merged);
      });
    });
  }

  /**
   * Save updated settings
   * @param {Object} partialSettings
   * @returns {Promise<Object>} The full updated settings object
   */
  async saveSettings(partialSettings) {
    const current = await this.getSettings();
    const updated = { ...current, ...partialSettings };

    return new Promise((resolve, reject) => {
      const area = this.storageArea;
      if (!area) {
        resolve(updated);
        return;
      }

      area.set({ [this.storageKey]: updated }, () => {
        if (chrome.runtime && chrome.runtime.lastError) {
          console.warn('[WhatsApp Privacy] Storage save error:', chrome.runtime.lastError.message);
          // Fallback to chrome.storage.local if sync quota or sync failed
          if (chrome.storage.local && area !== chrome.storage.local) {
            chrome.storage.local.set({ [this.storageKey]: updated }, () => resolve(updated));
            return;
          }
          reject(chrome.runtime.lastError);
          return;
        }
        resolve(updated);
      });
    });
  }

  /**
   * Reset all settings to factory defaults
   * @returns {Promise<Object>}
   */
  async resetSettings() {
    return new Promise((resolve) => {
      const area = this.storageArea;
      const defaults = { ...this.defaults };

      if (!area) {
        resolve(defaults);
        return;
      }

      area.set({ [this.storageKey]: defaults }, () => {
        resolve(defaults);
      });
    });
  }

  /**
   * Listen for live changes from other extension contexts (e.g. popup)
   * @param {Function} callback
   */
  onChanged(callback) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (changes[this.storageKey]) {
          const newSettings = {
            ...this.defaults,
            ...(changes[this.storageKey].newValue || {})
          };
          callback(newSettings, areaName);
        }
      });
    }
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.waPrivacyStorage = new WAPrivacyStorage();
}
