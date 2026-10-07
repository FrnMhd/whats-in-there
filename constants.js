/**
 * WhatsApp Privacy Shield - Constants & Configuration
 * Pure local constants and resilient selector maps.
 */

const WA_PRIVACY_CONSTANTS = {
  // Storage version & key
  STORAGE_KEY: 'wa_privacy_settings',
  SETTINGS_VERSION: 1,

  // Default extension configuration
  DEFAULT_SETTINGS: {
    version: 1,
    enabled: true,

    // Chat list / Sidebar
    blurSidebarNames: true,
    blurMessagePreview: true,
    blurTimestamps: true,
    blurProfilePhotos: true,
    hideProfilePhotos: false,
    hideUnreadCounts: false,

    // Active Chat
    blurMessages: true,
    blurIncomingMessages: true,
    blurOutgoingMessages: true,
    blurMedia: true,
    blurHeader: true,
    blurHeaderAvatar: true,
    blurStatus: true,

    // Reveal Behaviors
    holdAltToReveal: true,
    hoverReveal: false,

    // Blur Strength (in pixels)
    blurRadius: 10,

    // Diagnostics & Debug
    debug: false
  },

  // Document body state classes
  CLASSES: {
    ACTIVE: 'wa-privacy-active',
    BLUR_SIDEBAR_NAMES: 'wa-privacy-blur-sidebar-names',
    BLUR_SIDEBAR_PREVIEWS: 'wa-privacy-blur-sidebar-previews',
    BLUR_SIDEBAR_TIMESTAMPS: 'wa-privacy-blur-sidebar-timestamps',
    BLUR_SIDEBAR_AVATARS: 'wa-privacy-blur-sidebar-avatars',
    HIDE_SIDEBAR_AVATARS: 'wa-privacy-hide-sidebar-avatars',
    HIDE_UNREAD_COUNTS: 'wa-privacy-hide-unread-counts',

    BLUR_MESSAGES: 'wa-privacy-blur-messages',
    BLUR_INCOMING_MESSAGES: 'wa-privacy-blur-incoming-messages',
    BLUR_OUTGOING_MESSAGES: 'wa-privacy-blur-outgoing-messages',
    BLUR_MEDIA: 'wa-privacy-blur-media',
    BLUR_HEADER: 'wa-privacy-blur-header',
    BLUR_HEADER_AVATAR: 'wa-privacy-blur-header-avatar',
    HIDE_HEADER_AVATAR: 'wa-privacy-hide-header-avatar',
    BLUR_STATUS: 'wa-privacy-blur-status',

    ALT_REVEAL: 'wa-privacy-alt-reveal',
    HOVER_REVEAL_ENABLED: 'wa-privacy-hover-reveal-enabled'
  },

  // Extension tags applied to detected elements
  TAGS: {
    ITEM_BLUR: 'wa-privacy-blur-item',
    ITEM_HIDE: 'wa-privacy-hide-item',
    SIDEBAR_CELL: 'wa-privacy-sidebar-cell',
    SIDEBAR_NAME: 'wa-privacy-target-sidebar-name',
    SIDEBAR_PREVIEW: 'wa-privacy-target-sidebar-preview',
    SIDEBAR_TIME: 'wa-privacy-target-sidebar-time',
    SIDEBAR_AVATAR: 'wa-privacy-target-sidebar-avatar',
    UNREAD_BADGE: 'wa-privacy-target-unread-badge',

    MSG_CONTAINER: 'wa-privacy-msg-bubble',
    MSG_INCOMING: 'wa-privacy-msg-in',
    MSG_OUTGOING: 'wa-privacy-msg-out',
    MSG_TEXT: 'wa-privacy-target-msg-text',
    MSG_MEDIA: 'wa-privacy-target-msg-media',

    HEADER_CONTAINER: 'wa-privacy-header-container',
    HEADER_NAME: 'wa-privacy-target-header-name',
    HEADER_AVATAR: 'wa-privacy-target-header-avatar',
    HEADER_STATUS: 'wa-privacy-target-header-status'
  },

  // Candidate multi-strategy fallback selectors for DOM detection
  SELECTORS: {
    APP_ROOT: [
      '#app',
      'div[id="app"]',
      'body > div[id="app"]',
      'body'
    ],
    SIDEBAR_PANEL: [
      '#pane-side',
      'div[id="pane-side"]',
      'div[data-testid="chat-list"]',
      'div[aria-label*="Chat list" i]',
      'div[aria-label*="Chats" i]',
      'div[role="grid"]',
      'div[role="region"]'
    ],
    SIDEBAR_CELLS: [
      'div[role="listitem"]',
      'div[role="row"]',
      'div[data-testid="cell-frame-container"]',
      'div[data-testid^="list-item-"]',
      'div[tabindex="-1"][role="gridcell"]',
      'div[tabindex="-1"][role="row"]'
    ],
    MAIN_PANEL: [
      '#main',
      'div[id="main"]',
      'div[data-testid="conversation-panel-wrapper"]',
      'div[role="region"][aria-label*="Chat" i]'
    ],
    MESSAGE_CONTAINERS: [
      'div[data-testid^="msg-"]',
      'div[data-id]',
      'div.message-in',
      'div.message-out',
      'div[class*="message-in"]',
      'div[class*="message-out"]',
      'div[class*="focusable-list-item"]'
    ],
    MESSAGE_LIST: [
      'div[data-testid="conversation-panel-messages"]',
      'div[role="application"]',
      'div[aria-label*="Message list" i]',
      'div[data-testid="msg-container"]',
      'div[tabindex="-1"][data-tab]'
    ],
    HEADER: [
      '#main header',
      'header[data-testid="conversation-header"]',
      'header',
      'div[data-testid="conversation-header"]'
    ]
  }
};

// Export to global scope for browser content script environment
if (typeof window !== 'undefined') {
  window.WA_PRIVACY_CONSTANTS = WA_PRIVACY_CONSTANTS;
}
