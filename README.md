# WhatsApp Privacy Shield 🛡️

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg?style=flat-square)](manifest.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Zero Telemetry](https://img.shields.io/badge/Telemetry-0%25%20(Pure%20Local)-brightgreen.svg?style=flat-square)](#-privacy--security-guarantee)
[![Browser Support](https://img.shields.io/badge/Browsers-Chrome%20%7C%20Edge%20%7C%20Brave%20%7C%20Arc%20%7C%20Opera-informational.svg?style=flat-square)](#-installation)

**WhatsApp Privacy Shield** is a high-performance, resilient open-source browser extension (Manifest V3) for WhatsApp Web that provides customizable, real-time visual privacy protection. Prevent shoulder-surfing and screen recording leaks while maintaining a seamless messaging workflow.

---

## 🌟 Key Features

### 📋 Chat List (Sidebar) Protection
- **Sender Names**: Blur contact and group names in the left-hand panel.
- **Message Previews**: Obscure snippet previews of recent messages.
- **Timestamps**: Conceal message arrival times.
- **Profile Pictures**: Blur or **completely hide** avatars with zero layout shifting.
- **Unread Badges**: Hide unread message counters.

### 💬 Active Conversation Protection
- **Message Bubbles**: Blur incoming and outgoing message text and quoted replies.
- **Media Previews**: Obscure images, videos, stickers, voice notes, audio waveforms, GIFs, and document attachments.
- **Header Info**: Blur active contact names, group titles, and typing/online indicators.

### ⚡ Instant Reveal Controls
- **Hold <kbd>Alt</kbd>**: Hold down <kbd>Alt</kbd> to temporarily reveal all blurred items. Releasing re-engages protection immediately.
- **Hover to Reveal**: Hover cursor over any specific blurred element or message bubble to view it on demand.
- **Quick Keyboard Shortcut**: Toggle privacy protection globally with <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>X</kbd> (Mac: <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>X</kbd>).

### 🎛️ Real-Time Customization
- **Adjustable Blur Strength**: Live slider from `2px` (subtle) to `25px` (heavy).
- **Zero Page Reloads**: Settings update immediately across all open WhatsApp tabs via `chrome.storage.sync`.
- **System Nav Immunity**: Left navigation rails (Chats, Calls, Status, Settings) remain crisp and unblurred.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
|---|---|---|
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>X</kbd> | **Toggle Privacy** | Turn Privacy Shield ON or OFF globally |
| <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>X</kbd> | **Toggle Privacy (macOS)** | Turn Privacy Shield ON or OFF globally |
| Hold <kbd>Alt</kbd> | **Temporary Live Reveal** | Unblurs all content while held down |
| Release <kbd>Alt</kbd> | **Restore Shield** | Re-applies all blur filters instantly |

---

## 🚀 Installation

### Option 1: Load Unpacked (Chromium Browsers)

Compatible with **Google Chrome**, **Microsoft Edge**, **Brave**, **Arc**, **Vivaldi**, and **Opera**:

1. Clone or download this repository:
   ```bash
   git clone https://github.com/FrnMhd/whats-in-there.git
   ```
2. Open your browser's extension manager:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** (top-left button).
5. Select the project folder.
6. Navigate to [https://web.whatsapp.com](https://web.whatsapp.com) to start using Privacy Shield.

---

## 📁 Repository Structure

```
whats-in/
├── manifest.json         # Manifest V3 extension configuration
├── background.js        # Background service worker (shortcuts & initialization)
├── constants.js         # Configuration keys, CSS classes, and selector maps
├── storage.js           # chrome.storage.sync wrapper with automatic fallbacks
├── dom-detector.js      # Multi-strategy resilient DOM detection engine
├── privacy-engine.js    # Visual filter & body class controller
├── observer.js          # Throttled MutationObserver for SPA navigation
├── diagnostics.js       # Live developer diagnostics & health-check tools
├── content.js           # Content script entrypoint & keyboard listeners
├── styles.css           # Hardware-accelerated CSS blur & reveal rules
├── popup/
│   ├── popup.html       # Clean, modern dark-themed popup UI
│   ├── popup.css        # Responsive styling & toggle sliders
│   └── popup.js         # Settings data-binding & real-time sync
├── icons/
│   ├── 16.png           # 16x16 icon
│   ├── 48.png           # 48x48 icon
│   └── 128.png          # 128x128 icon
├── .gitignore           # Comprehensive Git ignore rules
├── CONTRIBUTING.md      # Contribution guidelines
├── LICENSE              # MIT License
└── package.json         # Project metadata & build scripts
```

---

## 🧠 Architecture & Selector Resilience

WhatsApp Web uses dynamic obfuscation for CSS classes, which frequently change across deployments. To ensure uninterrupted privacy, this extension uses a **Dual-Engine Architecture**:

1. **Semantic DOM Strategy**:
   - Analyzes semantic ARIA roles (`div[role="row"]`, `div[role="listitem"]`, `div[role="gridcell"]`, `header`).
   - Targets layout hierarchies (`span[title]`, `div.copyable-text`, `span.selectable-text`).
   - Automatically tags detected elements with stable internal markers (`wa-privacy-target-*`).

2. **Throttled MutationObserver**:
   - Tracks dynamic single-page application (SPA) transitions and incoming messages.
   - Utilizes `WeakSet` tracking to prevent duplicate DOM queries.
   - Employs `requestAnimationFrame` batching (40ms) to ensure smooth 60fps scrolling even with thousands of messages.

3. **Pure CSS Engine**:
   - Applies hardware-accelerated GPU filters (`--wa-privacy-blur-radius`).
   - Prevents layout recalculations and DOM jumps when toggling or hiding elements.

---

## 🛠️ Diagnostics & Developer Tools

Open Chrome DevTools (`F12` or `Ctrl`+`Shift`+`I`) on WhatsApp Web and run any of these helpers in the **Console**:

### Run Live Health Report
```javascript
window.WhatsAppPrivacyDiagnostics();
```
*Returns an anonymized JSON report verifying detected DOM components, active body classes, and element counts without logging private text.*

### Force Rescan & Re-tag
```javascript
window.WhatsAppPrivacyRefresh();
```

### Toggle via Console
```javascript
window.WhatsAppPrivacyEnable();
window.WhatsAppPrivacyDisable();
```

---

## 🔒 Privacy & Security Guarantee

- **100% Local Processing**: All visual filters and DOM checks occur entirely on your local machine.
- **Zero Network Requests**: The extension contains no analytics, telemetry, trackers, or remote server dependencies.
- **Content Neutral**: The extension never reads, modifies, stores, or logs message texts, contact numbers, or media files.
- **Minimal Permissions**: Requests only the `storage` permission to preserve your personal preferences across browser sessions.

---

## 🤝 Contributing

Contributions are welcome! Please check out [CONTRIBUTING.md](CONTRIBUTING.md) for local setup instructions, coding conventions, and PR guidelines.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
