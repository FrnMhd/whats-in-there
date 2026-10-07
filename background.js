/**
 * WhatsApp Privacy Shield - Background Service Worker (Manifest V3)
 * Handles extension installation defaults and global keyboard commands.
 */

// Default extension configuration
const DEFAULT_SETTINGS = {
  version: 1,
  enabled: true,

  blurSidebarNames: true,
  blurMessagePreview: true,
  blurTimestamps: true,
  blurProfilePhotos: true,
  hideProfilePhotos: false,
  hideUnreadCounts: false,

  blurMessages: true,
  blurIncomingMessages: true,
  blurOutgoingMessages: true,
  blurMedia: true,
  blurHeader: true,
  blurHeaderAvatar: true,
  blurStatus: true,

  holdAltToReveal: true,
  hoverReveal: false,

  blurRadius: 10,
  debug: false
};

const STORAGE_KEY = 'wa_privacy_settings';

// Initialize default settings on install
chrome.runtime.onInstalled.addListener(async () => {
  const storage = chrome.storage.sync || chrome.storage.local;
  if (!storage) return;

  storage.get([STORAGE_KEY], (res) => {
    if (!res || !res[STORAGE_KEY]) {
      storage.set({ [STORAGE_KEY]: DEFAULT_SETTINGS });
    } else {
      // Merge with any new default keys across extension updates
      const merged = { ...DEFAULT_SETTINGS, ...res[STORAGE_KEY] };
      storage.set({ [STORAGE_KEY]: merged });
    }
  });
});

// Handle global keyboard command (Ctrl+Shift+X or Cmd+Shift+X)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-privacy') {
    const storage = chrome.storage.sync || chrome.storage.local;
    if (!storage) return;

    storage.get([STORAGE_KEY], (res) => {
      const stored = (res && res[STORAGE_KEY]) ? res[STORAGE_KEY] : {};
      const current = { ...DEFAULT_SETTINGS, ...stored };
      const newEnabled = !current.enabled;
      storage.set({ [STORAGE_KEY]: { ...current, enabled: newEnabled } });
    });
  }
});

