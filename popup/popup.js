/**
 * WhatsApp Privacy Shield - Popup Controller
 * Connects UI toggles and slider with chrome.storage.sync for live synchronization.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const storage = window.waPrivacyStorage || new WAPrivacyStorage();
  const radiusValueDisplay = document.getElementById('blur-radius-value');
  const btnReset = document.getElementById('btn-reset');
  const resetConfirm = document.getElementById('reset-confirm');

  // Input elements mapping
  const inputs = {
    enabled: document.getElementById('setting-enabled'),
    blurSidebarNames: document.getElementById('setting-blurSidebarNames'),
    blurMessagePreview: document.getElementById('setting-blurMessagePreview'),
    blurTimestamps: document.getElementById('setting-blurTimestamps'),
    blurProfilePhotos: document.getElementById('setting-blurProfilePhotos'),
    hideProfilePhotos: document.getElementById('setting-hideProfilePhotos'),
    hideUnreadCounts: document.getElementById('setting-hideUnreadCounts'),
    blurMessages: document.getElementById('setting-blurMessages'),
    blurMedia: document.getElementById('setting-blurMedia'),
    blurHeader: document.getElementById('setting-blurHeader'),
    blurStatus: document.getElementById('setting-blurStatus'),
    holdAltToReveal: document.getElementById('setting-holdAltToReveal'),
    hoverReveal: document.getElementById('setting-hoverReveal'),
    blurRadius: document.getElementById('setting-blurRadius')
  };

  /**
   * Populate UI with current stored settings
   */
  async function loadAndPopulateSettings() {
    const settings = await storage.getSettings();

    for (const [key, input] of Object.entries(inputs)) {
      if (!input) continue;
      if (input.type === 'checkbox') {
        input.checked = !!settings[key];
      } else if (input.type === 'range') {
        input.value = settings[key] || 10;
        if (radiusValueDisplay) {
          radiusValueDisplay.textContent = `${input.value}px`;
        }
      }
    }
  }

  /**
   * Save a single setting key-value pair immediately to storage
   */
  async function updateSetting(key, value) {
    const patch = { [key]: value };

    // If enabling hideProfilePhotos, ensure blurProfilePhotos syncs appropriately
    if (key === 'hideProfilePhotos' && value === true) {
      patch.blurProfilePhotos = false;
      if (inputs.blurProfilePhotos) inputs.blurProfilePhotos.checked = false;
    }
    if (key === 'blurProfilePhotos' && value === true) {
      patch.hideProfilePhotos = false;
      if (inputs.hideProfilePhotos) inputs.hideProfilePhotos.checked = false;
    }

    await storage.saveSettings(patch);
  }

  // Attach change listeners to all checkbox inputs
  for (const [key, input] of Object.entries(inputs)) {
    if (!input) continue;
    if (input.type === 'checkbox') {
      input.addEventListener('change', (e) => {
        updateSetting(key, e.target.checked);
      });
    }
  }

  // Attach input & change listener to range slider
  if (inputs.blurRadius) {
    inputs.blurRadius.addEventListener('input', (e) => {
      const val = e.target.value;
      if (radiusValueDisplay) {
        radiusValueDisplay.textContent = `${val}px`;
      }
    });

    inputs.blurRadius.addEventListener('change', (e) => {
      updateSetting('blurRadius', Number(e.target.value));
    });
  }

  // Reset to defaults button
  if (btnReset) {
    btnReset.addEventListener('click', async () => {
      await storage.resetSettings();
      await loadAndPopulateSettings();

      if (resetConfirm) {
        resetConfirm.classList.remove('hidden');
        setTimeout(() => {
          resetConfirm.classList.add('hidden');
        }, 2000);
      }
    });
  }

  // Initial load
  await loadAndPopulateSettings();
});
