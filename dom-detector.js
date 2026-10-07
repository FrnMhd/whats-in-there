/**
 * WhatsApp Privacy Shield - Resilient Multi-Strategy DOM Detector
 * Inspects real DOM structures without relying on brittle obfuscated classes.
 */

class WAPrivacyDOMDetector {
  constructor() {
    this.constants = WA_PRIVACY_CONSTANTS;
    this.processedElements = new WeakSet();
    this.debug = false;

    // Cache of verified working selectors to speed up execution
    this.cachedSelectors = {
      appRoot: null,
      sidebarPanel: null,
      mainPanel: null,
      messageList: null,
      header: null
    };
  }

  setDebug(enabled) {
    this.debug = !!enabled;
  }

  logDebug(message, data) {
    if (this.debug) {
      if (data !== undefined) {
        console.log(`[WhatsApp Privacy Debug] ${message}`, data);
      } else {
        console.log(`[WhatsApp Privacy Debug] ${message}`);
      }
    }
  }

  /**
   * Helper: Try candidate selectors in priority order and return first matching element
   */
  resolveFirst(candidates, root = document) {
    for (const sel of candidates) {
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (err) {
        // Selector syntax warning suppressed in prod
      }
    }
    return null;
  }

  /**
   * Helper: Try candidate selectors and return list of matching elements
   */
  resolveAll(candidates, root = document) {
    for (const sel of candidates) {
      try {
        const list = root.querySelectorAll(sel);
        if (list && list.length > 0) return Array.from(list);
      } catch (err) {
        // Candidate failed, try next
      }
    }
    return [];
  }

  /**
   * Get WhatsApp Root Container
   */
  getAppRoot() {
    if (this.cachedSelectors.appRoot && document.querySelector(this.cachedSelectors.appRoot)) {
      return document.querySelector(this.cachedSelectors.appRoot);
    }
    const root = this.resolveFirst(this.constants.SELECTORS.APP_ROOT);
    if (root && root.id) {
      this.cachedSelectors.appRoot = `#${root.id}`;
    }
    return root || document.body;
  }

  /**
   * Get Sidebar Panel (Chat List Pane)
   */
  getSidebarPanel() {
    const root = this.getAppRoot();
    const panel = this.resolveFirst(this.constants.SELECTORS.SIDEBAR_PANEL, root);
    return panel;
  }

  /**
   * Get Main Active Conversation Panel
   */
  getMainPanel() {
    const root = this.getAppRoot();
    const main = this.resolveFirst(this.constants.SELECTORS.MAIN_PANEL, root);
    return main;
  }

  /**
   * Get Active Chat Header
   */
  getHeader() {
    const main = this.getMainPanel() || document;
    return this.resolveFirst(this.constants.SELECTORS.HEADER, main);
  }

  /**
   * Safely tag an element with an extension class and blur item marker
   */
  tagElement(el, tagClass) {
    if (!el || !(el instanceof Element)) return;
    if (!el.classList.contains(tagClass)) {
      el.classList.add(tagClass);
    }
    if (!el.classList.contains(this.constants.TAGS.ITEM_BLUR)) {
      el.classList.add(this.constants.TAGS.ITEM_BLUR);
    }
  }

  /**
   * Remove a tag from an element
   */
  untagElement(el, tagClass) {
    if (!el || !(el instanceof Element)) return;
    el.classList.remove(tagClass);
  }

  // ==========================================
  // SIDEBAR / CHAT LIST DETECTION
  // ==========================================

  /**
   * Find all individual chat cells in the sidebar
   */
  getSidebarCells(sidebarRoot = null) {
    const sidebar = sidebarRoot || this.getSidebarPanel();
    if (!sidebar) return [];

    let rawCells = [];

    // Try standard candidate selectors
    let cells = this.resolveAll(this.constants.SELECTORS.SIDEBAR_CELLS, sidebar);
    if (cells.length > 0) {
      rawCells = cells;
    } else {
      // Semantic / ARIA fallback: find gridcells or listitems
      const ariaCells = sidebar.querySelectorAll('div[role="row"], div[role="listitem"], div[role="gridcell"]');
      if (ariaCells.length > 0) {
        rawCells = Array.from(ariaCells);
      } else {
        // Structural fallback: divs with tabindex="-1" inside sidebar
        const tabindexCells = sidebar.querySelectorAll('div[tabindex="-1"]');
        if (tabindexCells.length > 0) {
          rawCells = Array.from(tabindexCells).filter(el => el.offsetHeight > 40);
        }
      }
    }

    // STRICT FILTER: Exclude anything in the left navigation rail or header
    return rawCells.filter(cell => {
      if (!cell || !(cell instanceof Element)) return false;
      if (cell.closest('div[role="navigation"]') || cell.closest('#side > header') || cell.closest('header[data-testid="chatlist-header"]')) {
        return false;
      }
      return true;
    });
  }

  /**
   * Detect and tag sensitive elements inside a single sidebar chat cell
   */
  processSidebarCell(cell) {
    if (!cell || !(cell instanceof Element)) return;

    // Guard: ignore left navigation bar or top search area
    if (cell.closest('div[role="navigation"]') || cell.closest('#side > header') || cell.closest('header[data-testid="chatlist-header"]')) {
      return;
    }

    // 1. Contact / Chat Name
    let nameEl = cell.querySelector('[data-testid="cell-frame-title"] span, span[title]:not([data-icon]):not([aria-label*=":"])');
    if (!nameEl) {
      const candidates = cell.querySelectorAll('span[dir="auto"][title], span[title]');
      for (const cand of candidates) {
        if (!cand.querySelector('svg') && cand.getAttribute('title') && cand.innerText.trim().length > 0) {
          nameEl = cand;
          break;
        }
      }
    }
    if (nameEl) {
      this.tagElement(nameEl, this.constants.TAGS.SIDEBAR_NAME);
    }

    // 2. Last Message Preview
    let previewEl = cell.querySelector('[data-testid="last-msg-status"], span[data-testid="last-msg"]');
    if (!previewEl) {
      const spans = cell.querySelectorAll('span[dir="ltr"], span[dir="auto"], span[class*="emojitext"]');
      for (const span of spans) {
        if (span !== nameEl && (!nameEl || !nameEl.contains(span)) && span.innerText.trim().length > 0) {
          const text = span.innerText.trim();
          const isTimestamp = /^(\d{1,2}:\d{2}(\s?[ap]m)?|\b(yesterday|today|ayer|ontem|hier|ieri|gestern)\b|\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i.test(text);
          if (!isTimestamp) {
            previewEl = span;
            break;
          }
        }
      }
    }
    if (previewEl) {
      this.tagElement(previewEl, this.constants.TAGS.SIDEBAR_PREVIEW);
    }

    // 3. Timestamp
    let timeEl = null;
    const allSpans = cell.querySelectorAll('span, div');
    for (const el of allSpans) {
      const text = el.innerText ? el.innerText.trim() : '';
      if (/^(\d{1,2}:\d{2}(\s?[ap]m)?|\b(yesterday|today|ayer|ontem|hier|ieri|gestern)\b|\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})$/i.test(text)) {
        timeEl = el;
        break;
      }
    }
    if (timeEl) {
      this.tagElement(timeEl, this.constants.TAGS.SIDEBAR_TIME);
    }

    // 4. Profile Picture / Avatar (Only inside chat cell, strictly excluding svgs/meta icons in left nav)
    let avatarEl = cell.querySelector('img[src*="whatsapp.net"], img[src*="blob:"], div[data-testid="avatar"], div[data-testid="cell-frame-container"] img');
    if (!avatarEl) {
      const imgs = cell.querySelectorAll('img');
      for (const img of imgs) {
        if (!img.getAttribute('data-icon') && !img.closest('svg') && !img.closest('[aria-label*="meta" i]')) {
          avatarEl = img;
          break;
        }
      }
    }
    if (!avatarEl) {
      // Fallback for default avatar placeholders (e.g. user without profile picture)
      avatarEl = cell.querySelector('div[data-testid="avatar-placeholder"], span[data-icon="default-user"]');
    }
    if (avatarEl) {
      this.tagElement(avatarEl, this.constants.TAGS.SIDEBAR_AVATAR);
    }

    // 5. Unread Count Badge
    const unreadEl = cell.querySelector('span[aria-label*="unread" i], [data-testid="icon-unread-count"]');
    if (unreadEl) {
      this.tagElement(unreadEl, this.constants.TAGS.UNREAD_BADGE);
    }
  }

  // ==========================================
  // ACTIVE CHAT & MESSAGE DETECTION
  // ==========================================

  /**
   * Find all message bubbles in the active conversation
   */
  getMessageBubbles(mainRoot = null) {
    const main = mainRoot || this.getMainPanel();
    if (!main) return [];

    let rawMessages = [];
    let messages = this.resolveAll(this.constants.SELECTORS.MESSAGE_CONTAINERS, main);
    if (messages.length > 0) {
      rawMessages = messages;
    } else {
      // Structural fallback: divs with message selectable text or copyable-text inside main
      const copyable = main.querySelectorAll('div.copyable-text, div[class*="message-"]');
      if (copyable.length > 0) {
        rawMessages = Array.from(copyable);
      }
    }

    // STRICT FILTER: Exclude anything inside header or footer (input bar)
    return rawMessages.filter(msg => {
      if (!msg || !(msg instanceof Element)) return false;
      if (msg.closest('header') || msg.closest('footer') || msg.closest('div[data-testid="conversation-header"]')) {
        return false;
      }
      return true;
    });
  }

  /**
   * Detect and tag sensitive content inside a single message bubble
   */
  processMessageBubble(msg) {
    if (!msg || !(msg instanceof Element)) return;

    // STRICT GUARD: Do not process header or footer as message
    if (msg.closest('header') || msg.closest('footer') || msg.closest('div[data-testid="conversation-header"]')) {
      return;
    }

    // Classify incoming vs outgoing
    const isIncoming = msg.classList.contains('message-in') ||
      msg.classList.contains(this.constants.TAGS.MSG_INCOMING) ||
      !!msg.querySelector('span[data-testid="tail-in"]') ||
      (!msg.classList.contains('message-out') && !msg.querySelector('span[data-testid="tail-out"]'));

    const isOutgoing = msg.classList.contains('message-out') ||
      msg.classList.contains(this.constants.TAGS.MSG_OUTGOING) ||
      !!msg.querySelector('span[data-testid="tail-out"]');

    if (isIncoming) {
      msg.classList.add(this.constants.TAGS.MSG_INCOMING);
    }
    if (isOutgoing) {
      msg.classList.add(this.constants.TAGS.MSG_OUTGOING);
    }

    // 1. Message Text
    const textEls = msg.querySelectorAll('span.selectable-text, .copyable-text span[dir], div[data-testid="quoted-message"]');
    if (textEls.length > 0) {
      textEls.forEach(el => this.tagElement(el, this.constants.TAGS.MSG_TEXT));
    } else {
      const dirSpans = msg.querySelectorAll('span[dir="ltr"], span[dir="rtl"], span[dir="auto"]');
      dirSpans.forEach(span => {
        if (!span.querySelector('svg') && !span.getAttribute('data-icon')) {
          this.tagElement(span, this.constants.TAGS.MSG_TEXT);
        }
      });
    }

    // 2. Message Media (Images, Videos, Stickers, GIFs, Audio previews)
    const mediaEls = msg.querySelectorAll('img:not([data-icon]):not([class*="emoji"]), video, canvas, div[data-testid="media-canvas"], div[data-testid="audio-player"], div[data-testid="image-thumb"], div[data-testid="video-thumb"]');
    mediaEls.forEach(media => {
      this.tagElement(media, this.constants.TAGS.MSG_MEDIA);
    });
  }

  // ==========================================
  // ACTIVE CHAT HEADER DETECTION
  // ==========================================

  /**
   * Detect and tag sensitive elements in the active chat header
   */
  processHeader(header = null) {
    const hdr = header || this.getHeader();
    if (!hdr) return;

    // 1. Active Contact Name / Group Title
    let nameEl = hdr.querySelector('div[role="button"] span[title], span[title], span[dir="auto"]');
    if (nameEl) {
      this.tagElement(nameEl, this.constants.TAGS.HEADER_NAME);
    }

    // 2. Active Contact Avatar
    let avatarEl = hdr.querySelector('img[src*="whatsapp.net"], img[src*="blob:"], div[data-testid="avatar"] img, div[data-testid="avatar"], div[role="button"] img');
    if (avatarEl) {
      this.tagElement(avatarEl, this.constants.TAGS.HEADER_AVATAR);
    }

    // 3. Status / Typing / Last seen text
    const allSpans = hdr.querySelectorAll('span');
    for (const span of allSpans) {
      if (span !== nameEl && (!nameEl || !nameEl.contains(span))) {
        const text = span.innerText ? span.innerText.toLowerCase().trim() : '';
        if (text.includes('online') || text.includes('typing') || text.includes('last seen') || text.includes('click here')) {
          this.tagElement(span, this.constants.TAGS.HEADER_STATUS);
        }
      }
    }
  }

  // ==========================================
  // BULK / ROOT SCANNING
  // ==========================================

  /**
   * Run full inspection and tag elements across the entire visible WhatsApp UI
   */
  scanAndTagAll() {
    // 1. Sidebar cells
    const cells = this.getSidebarCells();
    for (let i = 0; i < cells.length; i++) {
      this.processSidebarCell(cells[i]);
    }

    // 2. Header
    this.processHeader();

    // 3. Message bubbles
    const messages = this.getMessageBubbles();
    for (let i = 0; i < messages.length; i++) {
      this.processMessageBubble(messages[i]);
    }

    this.logDebug(`Scan completed: ${cells.length} sidebar cells, ${messages.length} messages tagged.`);
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.waPrivacyDOMDetector = new WAPrivacyDOMDetector();
}
