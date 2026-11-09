# ClearFrame

> Minimalist, privacy-first browser extension that removes distracting UI components from websites using configurable, independent rules.

---

## Features

- **Multi-Site Architecture**: Extensible site adapter architecture with independent rules for **YouTube**, **Reddit**, **Instagram**, and **LinkedIn**.
- **Distraction-Free Controls**:
  - **LinkedIn** *(inspired by Minimal Theme for LinkedIn)*:
    - Hide Algorithmic Feed (Focus Mode / anti-doomscrolling).
    - Hide Promoted Posts & Sponsored Ads.
    - Hide Right Sidebar (News & Trends) with feed centering.
    - Hide Left Profile / Analytics Sidebar.
    - Hide Floating Messaging Popup (#msg-overlay).
    - Simplify Top Navigation Bar (hide Premium and Business upsells).
  - **YouTube**:
    - Hide Shorts (navigation links, shelves, reel sections, and tabs).
    - Hide Left Sidebar & clean home video grid centering.
    - Hide Video Categories (topic filter chips).
    - Hide Header Buttons (mic, create, notifications, profile).
    - Clean Video Action Buttons (preserves only Subscribe, Like, and Save to Playlist).
    - Hide Video Description.
    - Center Video Player & Minimalist Layout.
    - Hide Related Videos on Watch Pages.
    - Hide Comments.
  - **Instagram**:
    - Hide Algorithmic Feed (Focus Mode / anti-doomscrolling).
    - Hide Stories Tray (top carousel).
    - Hide Floating Messages Button (floating chat pill in bottom-right corner).
    - Hide Right Sidebar (profile switcher, suggestions for you, footer links) and center main feed.
    - Simplify Navigation (Home, Messages & Profile only with permanent labels).
  - **Reddit**:
    - Hide Promoted Posts & Ads across Shreddit, New Reddit, and Old Reddit.
    - Hide "Recent Posts" and recommended community carousels.
- **Instant Updates**: Toggle rules on and off with zero-reload dynamic CSS updates.
- **Single-Page Application (SPA) Support**: Automatically applies and preserves rules across YouTube, Instagram, Reddit, and LinkedIn client-side routing.
- **Privacy First & Local Storage**:
  - No remote code or third-party servers.
  - Zero analytics, tracking, or telemetry.
  - Strictly relies on `chrome.storage.local`.
  - Minimal host permissions: only `*://*.youtube.com/*`, `*://*.reddit.com/*`, `*://*.instagram.com/*`, and `*://*.linkedin.com/*`.

---

## Development & Build Commands

### Prerequisites
- Node.js `>= 18.0.0`
- npm `>= 9.0.0`

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Extension in Development Mode
Starts WXT in development mode with Hot Module Replacement (HMR) and opens a test browser profile:
```bash
npm run dev
```

### 3. Build for Production
Generates an optimized, standard Manifest V3 extension bundle in `.output/chrome-mv3`:
```bash
npm run build
```
*(For Firefox: `npm run build:firefox`)*

### 4. Run Automated Tests
Executes unit tests and DOM fixture validation using Vitest:
```bash
npm run test
```

### 5. Run TypeScript Verification
Performs strict type checking across all adapters, core modules, and React components:
```bash
npm run typecheck
```

---

## Installation in Chrome / Edge (Developer Mode)

To install and test ClearFrame locally in any Chromium-based browser:

1. Run the build command:
   ```bash
   npm run build
   ```
2. Open your browser and navigate to:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
3. Enable **Developer mode** using the toggle in the upper-right corner.
4. Click the **Load unpacked** button in the top left.
5. In the file picker, select the generated build folder:
   ```text
   <path_to_project>/extensions/.output/chrome-mv3
   ```
6. ClearFrame is now active. Pin it to your browser toolbar and click the icon on YouTube or Reddit to configure rules.

---

## Architecture & Selectors

- Refer to [`docs/architecture.md`](./docs/architecture.md) for core engine design, storage schema normalization, and communication sequence diagrams.
- Refer to [`docs/selectors.md`](./docs/selectors.md) for details on all CSS selectors, targeted DOM nodes, and known limitations.
