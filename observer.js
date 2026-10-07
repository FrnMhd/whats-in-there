/**
 * WhatsApp Privacy Shield - Mutation Observer & DOM Watcher
 * Efficiently observes SPA transitions, chat switching, incoming messages, and scroll events.
 */

class WAPrivacyObserver {
  constructor(domDetector) {
    this.domDetector = domDetector;
    this.observer = null;
    this.isObserving = false;
    this.pendingMutations = [];
    this.batchTimeout = null;
    this.processedElements = new WeakSet();
    this.lastProcessedChatHeader = null;
  }

  /**
   * Start observing the WhatsApp DOM
   */
  start() {
    if (this.isObserving) return;

    const root = this.domDetector.getAppRoot();
    if (!root) {
      // Retry in 500ms if WhatsApp DOM is still bootstrapping
      setTimeout(() => this.start(), 500);
      return;
    }

    this.observer = new MutationObserver((mutations) => this.handleMutations(mutations));
    this.observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: false
    });

    this.isObserving = true;
    this.domDetector.logDebug('WhatsApp Privacy Observer STARTED on root:', root.id || root.tagName);

    // Initial full pass
    this.domDetector.scanAndTagAll();
  }

  /**
   * Stop observing
   */
  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    this.isObserving = false;
    this.domDetector.logDebug('WhatsApp Privacy Observer STOPPED.');
  }

  /**
   * Filter and batch mutation events to prevent UI lag
   */
  handleMutations(mutations) {
    let hasRelevantChanges = false;

    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];
      if (mutation.type !== 'childList' || mutation.addedNodes.length === 0) continue;

      for (let j = 0; j < mutation.addedNodes.length; j++) {
        const node = mutation.addedNodes[j];
        if (node.nodeType !== Node.ELEMENT_NODE) continue;

        // Skip our own injected extension containers if any
        if (node.id && node.id.startsWith('wa-privacy-')) continue;

        // Add to batch queue
        this.pendingMutations.push(node);
        hasRelevantChanges = true;
      }
    }

    if (hasRelevantChanges && !this.batchTimeout) {
      this.batchTimeout = setTimeout(() => {
        this.processBatch();
      }, 40);
    }
  }

  /**
   * Process the queued added nodes efficiently
   */
  processBatch() {
    this.batchTimeout = null;
    if (this.pendingMutations.length === 0) return;

    const nodes = this.pendingMutations;
    this.pendingMutations = [];

    // Use requestAnimationFrame for smooth UI rendering
    requestAnimationFrame(() => {
      let sidebarNeedsCheck = false;
      let messagesNeedsCheck = false;
      let headerNeedsCheck = false;

      for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i];
        if (!el || !el.isConnected) continue;

        // Fast check: Is it a message bubble or contains message bubbles?
        if (el.classList && (el.classList.contains('message-in') || el.classList.contains('message-out') || el.getAttribute('data-testid')?.startsWith('msg-'))) {
          this.domDetector.processMessageBubble(el);
          continue;
        }

        // Check if node is inside sidebar / chat list
        if (el.getAttribute('role') === 'row' || el.getAttribute('role') === 'listitem' || el.getAttribute('role') === 'gridcell') {
          this.domDetector.processSidebarCell(el);
          continue;
        }

        // Header check
        if (el.tagName === 'HEADER' || el.getAttribute('data-testid') === 'conversation-header') {
          this.domDetector.processHeader(el);
          continue;
        }

        // Broad subtree check
        if (el.querySelector) {
          if (el.querySelector('div[class*="message-"], div[data-testid^="msg-"]')) {
            messagesNeedsCheck = true;
          }
          if (el.querySelector('div[role="row"], div[data-testid="cell-frame-container"]')) {
            sidebarNeedsCheck = true;
          }
          if (el.querySelector('header')) {
            headerNeedsCheck = true;
          }
        }
      }

      if (messagesNeedsCheck) {
        const msgs = this.domDetector.getMessageBubbles();
        for (let i = 0; i < msgs.length; i++) {
          if (!this.processedElements.has(msgs[i])) {
            this.domDetector.processMessageBubble(msgs[i]);
            this.processedElements.add(msgs[i]);
          }
        }
      }

      if (sidebarNeedsCheck) {
        const cells = this.domDetector.getSidebarCells();
        for (let i = 0; i < cells.length; i++) {
          if (!this.processedElements.has(cells[i])) {
            this.domDetector.processSidebarCell(cells[i]);
            this.processedElements.add(cells[i]);
          }
        }
      }

      if (headerNeedsCheck) {
        this.domDetector.processHeader();
      }
    });
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.WAPrivacyObserver = WAPrivacyObserver;
}
