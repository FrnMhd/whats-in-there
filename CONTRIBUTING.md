# Contributing to WhatsApp Privacy Shield 🛡️

Thank you for your interest in contributing to **WhatsApp Privacy Shield**! We welcome contributions from the community to help make WhatsApp Web privacy more robust, performant, and accessible.

---

## 📋 Code of Conduct

Please be respectful, collaborative, and considerate in all interactions within this project.

---

## 🛠️ Local Development & Testing

1. **Clone the repository:**
   ```bash
   git clone https://github.com/FrnMhd/whats-in-there.git
   cd whats-in-there
   ```

2. **Load the Unpacked Extension in Chrome / Chromium:**
   - Open your Chromium-based browser (Google Chrome, Brave, Microsoft Edge, Arc, Opera).
   - Navigate to `chrome://extensions/` (or `edge://extensions/`).
   - Toggle **Developer mode** in the top right.
   - Click **Load unpacked** and select this directory.

3. **Test with WhatsApp Web:**
   - Open [https://web.whatsapp.com](https://web.whatsapp.com).
   - Test toggles in the extension popup.
   - Open the Browser DevTools console (`F12`) and run:
     ```javascript
     window.WhatsAppPrivacyDiagnostics();
     ```
   - Verify that all DOM elements are correctly identified and tagged.

---

## 🔒 Privacy & Architecture Guidelines

When submitting code changes, please adhere to these core principles:

1. **Zero External Requests**: No telemetry, analytics, remote scripts, or external network connections are permitted. Everything must run purely locally in the browser.
2. **Never Read / Log Message Content**: Diagnostic utilities and logs must never inspect, store, or print message text or personal data.
3. **Resilient DOM Detection**: Avoid relying solely on obfuscated CSS classes (e.g. `._ak8j`), as WhatsApp Web updates frequently break them. Always prefer semantic elements, ARIA attributes, structural paths, or multi-strategy fallbacks.
4. **Performance First**: DOM queries and mutations must be batched and throttled with `requestAnimationFrame` to avoid causing UI stutter during rapid scrolling or incoming messages.

---

## 🚀 Submitting a Pull Request

1. Fork the repo and create your feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
2. Commit your changes with clear, descriptive commit messages:
   ```bash
   git commit -m "feat: enhance media blur support for voice notes"
   ```
3. Push to your branch:
   ```bash
   git push origin feature/amazing-feature
   ```
4. Open a Pull Request on GitHub with a description of the changes, screenshots/recordings if UI-related, and test results.

---

## 🐞 Reporting Bugs & Requesting Features

Please open an issue on the GitHub Issues page and include:
- Browser and version (e.g., Chrome 124, Brave 1.65).
- OS (Windows, macOS, Linux).
- Reproduction steps.
- Output from `window.WhatsAppPrivacyDiagnostics()` (which is completely anonymized).
