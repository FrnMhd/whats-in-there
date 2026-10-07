/**
 * WhatsApp Privacy Shield - Content Script Entrypoint
 * Bootstraps privacy engine, storage listeners, observers, and keyboard shortcuts.
 */

(function initWhatsAppPrivacyShield() {
  // Prevent duplicate content script injection
  if (window.__WA_PRIVACY_SHIELD_INITIALIZED__) return;
  window.__WA_PRIVACY_SHIELD_INITIALIZED__ = true;

  const storage = window.waPrivacyStorage || new WAPrivacyStorage();
  const domDetector = window.waPrivacyDOMDetector || new WAPrivacyDOMDetector();
  const engine = new WAPrivacyEngine(domDetector);
  const observer = new WAPrivacyObserver(domDetector);

  // Expose engine to window for diagnostics
  window.waPrivacyEngine = engine;
  window.waPrivacyObserver = observer;

  /**
   * 1. Bootstrap Settings and Start Observer
   */
  async function bootstrap() {
    try {
      const settings = await storage.getSettings();
      engine.applySettings(settings);

      // Start mutation watcher
      observer.start();

      // Periodic check for SPA mount transitions
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (document.querySelector('#pane-side') || document.querySelector('#main') || attempts > 20) {
          clearInterval(interval);
          engine.applySettings(engine.currentSettings);
        }
      }, 500);

      domDetector.logDebug('WhatsApp Privacy Shield initialized successfully.');
    } catch (err) {
      console.warn('[WhatsApp Privacy] Bootstrap initialization warning:', err);
    }
  }

  /**
   * 2. Live Settings Sync (Zero Reload)
   */
  storage.onChanged((newSettings) => {
    engine.applySettings(newSettings);
  });

  /**
   * 3. Keyboard Shortcuts & Temporary Reveal
   */
  window.addEventListener('keydown', (e) => {
    // A. Hold ALT for Temporary Reveal
    if (e.key === 'Alt') {
      engine.setAltReveal(true);
    }

    // B. Ctrl + Shift + X Shortcut to Toggle Privacy Mode
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'X' || e.key === 'x')) {
      e.preventDefault();
      e.stopPropagation();
      engine.toggleGlobalEnabled();
    }
  }, { capture: true });

  window.addEventListener('keyup', (e) => {
    // Release ALT when Alt key is released or altKey modifier becomes false
    if (e.key === 'Alt' || !e.altKey) {
      engine.setAltReveal(false);
    }
  }, { capture: true });

  // Safe fallback: window blur, focus without alt, or tab visibility change restores privacy
  window.addEventListener('blur', () => {
    engine.setAltReveal(false);
  });

  window.addEventListener('focus', (e) => {
    if (!e || !e.altKey) {
      engine.setAltReveal(false);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      engine.setAltReveal(false);
    }
  });

  /**
   * 4. Runtime Message Listener (from background / popup)
   */
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message && message.type === 'TOGGLE_PRIVACY') {
        engine.toggleGlobalEnabled().then((newState) => {
          sendResponse({ success: true, enabled: newState });
        });
        return true; // Keep message channel open for async response
      }

      if (message && message.type === 'GET_DIAGNOSTICS') {
        if (typeof runWhatsAppPrivacyDiagnostics === 'function') {
          sendResponse(runWhatsAppPrivacyDiagnostics());
        } else {
          sendResponse({ error: 'Diagnostics not available' });
        }
        return true;
      }
    });
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
