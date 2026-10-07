/**
 * WhatsApp Privacy Shield - Diagnostics & Developer Tools
 * Live DOM health checker without logging any private text or contact details.
 */

function runWhatsAppPrivacyDiagnostics() {
  const detector = window.waPrivacyDOMDetector;
  const engine = window.waPrivacyEngine;
  const constants = window.WA_PRIVACY_CONSTANTS;

  const appRoot = detector ? detector.getAppRoot() : document.querySelector('#app') || document.body;
  const sidebarPanel = detector ? detector.getSidebarPanel() : document.querySelector('#pane-side');
  const sidebarCells = detector ? detector.getSidebarCells(sidebarPanel) : [];
  const mainPanel = detector ? detector.getMainPanel() : document.querySelector('#main');
  const messages = detector ? detector.getMessageBubbles(mainPanel) : [];
  const header = detector ? detector.getHeader() : document.querySelector('#main header');

  // Count tagged elements
  const taggedSidebarNames = document.querySelectorAll(`.${constants.TAGS.SIDEBAR_NAME}`).length;
  const taggedSidebarPreviews = document.querySelectorAll(`.${constants.TAGS.SIDEBAR_PREVIEW}`).length;
  const taggedSidebarTimes = document.querySelectorAll(`.${constants.TAGS.SIDEBAR_TIME}`).length;
  const taggedSidebarAvatars = document.querySelectorAll(`.${constants.TAGS.SIDEBAR_AVATAR}`).length;
  const taggedMessages = document.querySelectorAll(`.${constants.TAGS.MSG_TEXT}`).length;
  const taggedMedia = document.querySelectorAll(`.${constants.TAGS.MSG_MEDIA}`).length;
  const taggedHeaderNames = document.querySelectorAll(`.${constants.TAGS.HEADER_NAME}`).length;
  const taggedHeaderAvatars = document.querySelectorAll(`.${constants.TAGS.HEADER_AVATAR}`).length;

  const activeClasses = Array.from(document.body.classList).filter(c => c.startsWith('wa-privacy-'));

  const report = {
    timestamp: new Date().toISOString(),
    status: {
      whatsappDetected: !!appRoot && appRoot !== document.body,
      isShieldActive: document.body.classList.contains(constants.CLASSES.ACTIVE),
      isAltRevealing: document.body.classList.contains(constants.CLASSES.ALT_REVEAL)
    },
    domElements: {
      sidebar: {
        panelDetected: !!sidebarPanel,
        cellCount: sidebarCells.length,
        namesProtected: taggedSidebarNames,
        previewsProtected: taggedSidebarPreviews,
        timestampsProtected: taggedSidebarTimes,
        avatarsProtected: taggedSidebarAvatars
      },
      activeChat: {
        mainPanelDetected: !!mainPanel,
        messageCount: messages.length,
        textElementsProtected: taggedMessages,
        mediaElementsProtected: taggedMedia
      },
      header: {
        headerDetected: !!header,
        contactNameProtected: taggedHeaderNames > 0,
        avatarProtected: taggedHeaderAvatars > 0
      }
    },
    activeBodyClasses: activeClasses,
    currentSettings: engine ? engine.currentSettings : 'Unavailable'
  };

  return report;
}

// Attach console development helpers
if (typeof window !== 'undefined') {
  window.WhatsAppPrivacyDiagnostics = function () {
    const diag = runWhatsAppPrivacyDiagnostics();
    console.group('%c🛡️ WhatsApp Privacy Shield Diagnostics', 'color: #25D366; font-weight: bold; font-size: 13px;');
    console.log('Health Report:', diag);
    console.groupEnd();
    return diag;
  };

  window.WhatsAppPrivacyRefresh = function () {
    if (window.waPrivacyDOMDetector && window.waPrivacyEngine) {
      window.waPrivacyDOMDetector.scanAndTagAll();
      window.waPrivacyEngine.applySettings(window.waPrivacyEngine.currentSettings);
      console.log('🛡️ WhatsApp Privacy Shield: UI rescanned & refreshed.');
    }
  };

  window.WhatsAppPrivacyEnable = async function () {
    if (window.waPrivacyStorage) {
      await window.waPrivacyStorage.saveSettings({ enabled: true });
      console.log('🛡️ WhatsApp Privacy Shield: ENABLED');
    }
  };

  window.WhatsAppPrivacyDisable = async function () {
    if (window.waPrivacyStorage) {
      await window.waPrivacyStorage.saveSettings({ enabled: false });
      console.log('🛡️ WhatsApp Privacy Shield: DISABLED');
    }
  };
}
