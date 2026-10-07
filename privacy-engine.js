/**
 * WhatsApp Privacy Shield - Privacy Engine
 * Centralized controller managing privacy state, body classes, and visual filter effects.
 */

class WAPrivacyEngine {
  constructor(domDetector) {
    this.domDetector = domDetector;
    this.constants = WA_PRIVACY_CONSTANTS;
    this.currentSettings = { ...this.constants.DEFAULT_SETTINGS };
    this.isAltRevealed = false;
  }

  /**
   * Apply a complete settings object to the WhatsApp page
   * @param {Object} settings
   */
  applySettings(settings) {
    this.currentSettings = { ...settings };
    this.domDetector.setDebug(settings.debug);

    const body = document.body;
    if (!body) return;

    // 1. Update blur radius CSS variable
    const radius = Number(settings.blurRadius) || 10;
    document.documentElement.style.setProperty('--wa-privacy-blur-radius', `${radius}px`);

    // 2. Master ON/OFF Switch
    if (!settings.enabled) {
      this.clearAllPrivacyClasses();
      document.documentElement.style.setProperty('--wa-privacy-blur-radius', '0px');
      this.domDetector.logDebug('Privacy Shield DISABLED globally.');
      return;
    }

    body.classList.add(this.constants.CLASSES.ACTIVE);
    document.documentElement.classList.add(this.constants.CLASSES.ACTIVE);

    // 3. Chat List / Sidebar Settings
    this.toggleBodyClass(this.constants.CLASSES.BLUR_SIDEBAR_NAMES, settings.blurSidebarNames);
    this.toggleBodyClass(this.constants.CLASSES.BLUR_SIDEBAR_PREVIEWS, settings.blurMessagePreview);
    this.toggleBodyClass(this.constants.CLASSES.BLUR_SIDEBAR_TIMESTAMPS, settings.blurTimestamps);

    // Profile photos mode (Hide vs Blur)
    if (settings.hideProfilePhotos) {
      body.classList.remove(this.constants.CLASSES.BLUR_SIDEBAR_AVATARS);
      body.classList.add(this.constants.CLASSES.HIDE_SIDEBAR_AVATARS);
      body.classList.remove(this.constants.CLASSES.BLUR_HEADER_AVATAR);
      body.classList.add(this.constants.CLASSES.HIDE_HEADER_AVATAR);
    } else if (settings.blurProfilePhotos) {
      body.classList.remove(this.constants.CLASSES.HIDE_SIDEBAR_AVATARS);
      body.classList.add(this.constants.CLASSES.BLUR_SIDEBAR_AVATARS);
      body.classList.remove(this.constants.CLASSES.HIDE_HEADER_AVATAR);
      body.classList.add(this.constants.CLASSES.BLUR_HEADER_AVATAR);
    } else {
      body.classList.remove(this.constants.CLASSES.HIDE_SIDEBAR_AVATARS);
      body.classList.remove(this.constants.CLASSES.BLUR_SIDEBAR_AVATARS);
      body.classList.remove(this.constants.CLASSES.HIDE_HEADER_AVATAR);
      body.classList.remove(this.constants.CLASSES.BLUR_HEADER_AVATAR);
    }

    this.toggleBodyClass(this.constants.CLASSES.HIDE_UNREAD_COUNTS, settings.hideUnreadCounts);

    // 4. Active Chat & Message Settings
    this.toggleBodyClass(this.constants.CLASSES.BLUR_MESSAGES, settings.blurMessages);
    this.toggleBodyClass(this.constants.CLASSES.BLUR_MEDIA, settings.blurMedia);
    this.toggleBodyClass(this.constants.CLASSES.BLUR_HEADER, settings.blurHeader);
    this.toggleBodyClass(this.constants.CLASSES.BLUR_STATUS, settings.blurStatus);

    // 5. Reveal Behaviors
    this.toggleBodyClass(this.constants.CLASSES.HOVER_REVEAL_ENABLED, settings.hoverReveal);

    // 6. Run DOM Detector pass to tag any untagged elements
    this.domDetector.scanAndTagAll();
    this.domDetector.logDebug('Privacy Shield settings applied successfully.');
  }

  /**
   * Helper to add/remove a class on document.body and documentElement
   */
  toggleBodyClass(className, shouldAdd) {
    if (!document.body) return;
    if (shouldAdd) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
  }

  /**
   * Remove all privacy classes from document body and documentElement
   */
  clearAllPrivacyClasses() {
    if (document.body) {
      const classes = Object.values(this.constants.CLASSES);
      classes.forEach(cls => document.body.classList.remove(cls));
    }
    if (document.documentElement) {
      document.documentElement.classList.remove(this.constants.CLASSES.ACTIVE);
      document.documentElement.classList.remove(this.constants.CLASSES.ALT_REVEAL);
    }
  }

  /**
   * Temporary ALT-key reveal toggle
   * @param {boolean} isHoldingAlt
   */
  setAltReveal(isHoldingAlt) {
    if (!this.currentSettings.enabled || !this.currentSettings.holdAltToReveal) {
      if (document.body) {
        document.body.classList.remove(this.constants.CLASSES.ALT_REVEAL);
      }
      if (document.documentElement) {
        document.documentElement.classList.remove(this.constants.CLASSES.ALT_REVEAL);
      }
      this.isAltRevealed = false;
      return;
    }

    if (this.isAltRevealed === isHoldingAlt) return;
    this.isAltRevealed = isHoldingAlt;

    const baseRadius = Number(this.currentSettings.blurRadius) || 10;
    const targetRadius = isHoldingAlt ? 0 : baseRadius;

    document.documentElement.style.setProperty('--wa-privacy-blur-radius', `${targetRadius}px`);

    if (isHoldingAlt) {
      if (document.body) document.body.classList.add(this.constants.CLASSES.ALT_REVEAL);
      if (document.documentElement) document.documentElement.classList.add(this.constants.CLASSES.ALT_REVEAL);
      this.domDetector.logDebug('Temporary ALT reveal ACTIVE (radius set to 0px)');
    } else {
      if (document.body) document.body.classList.remove(this.constants.CLASSES.ALT_REVEAL);
      if (document.documentElement) document.documentElement.classList.remove(this.constants.CLASSES.ALT_REVEAL);
      this.domDetector.logDebug(`Temporary ALT reveal RELEASED (radius restored to ${baseRadius}px)`);
    }
  }

  /**
   * Toggle global enabled state
   * @returns {Promise<boolean>} New enabled status
   */
  async toggleGlobalEnabled() {
    const newEnabled = !this.currentSettings.enabled;
    if (typeof window !== 'undefined' && window.waPrivacyStorage) {
      await window.waPrivacyStorage.saveSettings({ enabled: newEnabled });
    }
    return newEnabled;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.WAPrivacyEngine = WAPrivacyEngine;
}
