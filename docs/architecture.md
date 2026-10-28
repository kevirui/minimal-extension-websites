# Architecture & Lifecycle: ClearFrame

ClearFrame is a minimalist, privacy-first browser extension engineered using Manifest V3, WXT (Vite-based), TypeScript, and React. Its primary purpose is to simplify and declutter modern websites (such as YouTube and Reddit) by selectively hiding distracting interface elements through configurable, independent rules.

---

## 1. Core Principles

- **Zero Surveillance & Least Privilege**: No external telemetry, remote script execution, analytics, or background servers. Storage is strictly local via `chrome.storage.local`.
- **Declarative Isolation**: Where possible, elements are hidden declaratively using scoped CSS (`display: none !important`), which is instantaneously enforced by browser layout engines without repetitive DOM scanning or performance penalties.
- **Dynamic Adaptability**: Handles Single-Page Application (SPA) navigations (such as YouTube's `yt-navigate-finish` and History API `pushState`) and asynchronous DOM element injection.
- **Modular Adapter Architecture**: The generic core does not hardcode any website-specific CSS selectors or DOM structures. Every target website is implemented as a self-contained `SiteAdapter`.
- **Safe Hostname Domain Matching**: Hostnames are matched against strict domain boundaries (`cleanHost === domainRoot || cleanHost.endsWith('.' + domainRoot)`), completely preventing deceptive spoof domains like `youtube.com.evil.org` from triggering adapters.

---

## 2. Directory Structure

```text
extensions/
├── .output/                     # Built extension output (chrome-mv3, firefox-mv3)
├── src/
│   ├── adapters/                # Site-specific adapter implementations
│   │   ├── index.ts             # Registry auto-loader
│   │   ├── youtube.ts           # YouTube rules, selectors & route scopes
│   │   ├── reddit.ts            # Reddit rules, selectors & route scopes
│   │   ├── applicability.test.ts # Route applicability tests
│   │   └── selectors.test.ts    # Fixture-based DOM verification tests
│   ├── components/              # UI components for extension popup
│   │   ├── PopupApp.tsx         # Main React popup application
│   │   ├── PopupApp.test.tsx    # Popup integration, scopes & messaging tests
│   │   ├── Switch.tsx           # Accessible toggle switch component with scope badges
│   │   └── popup.css            # Design tokens, quiet dark mode & reduced motion
│   ├── core/                    # Website-agnostic extension engine
│   │   ├── types.ts             # Rule, Adapter, Scope, Settings, and Message types
│   │   ├── registry.ts          # Adapter registry with strict domain boundary matching
│   │   ├── registry.test.ts     # Registry & domain spoofing tests
│   │   ├── storage.ts           # Versioned schema, WriteMutex & persistence
│   │   ├── storage.test.ts      # Storage, migration & concurrency tests
│   │   ├── memoryStorage.ts     # Test in-memory storage implementation
│   │   ├── engine.ts            # Ownership-aware style injection & cleanup
│   │   └── engine.test.ts       # Engine lifecycle tests
│   ├── entrypoints/             # WXT extension entrypoints
│   │   ├── content.ts           # Content script entrypoint & messaging listener
│   │   └── popup/               # Extension popup page
│   │       ├── index.html       # Popup HTML
│   │       └── main.tsx         # Popup React mounting point
│   └── test/
│       ├── fixtures.ts          # Representative DOM fixtures
│       └── setup.ts             # Vitest setup with jest-dom
├── docs/
│   ├── architecture.md          # Architecture, design tokens & lifecycle guide
│   └── selectors.md             # Selector definitions, rationale, and limitations
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── wxt.config.ts
```

---

## 3. Design Tokens & Visual Hierarchy

ClearFrame implements a restrained, dark token system (`src/components/popup.css`):

| Token Category | CSS Variables | Values / Purpose |
| :--- | :--- | :--- |
| **Surfaces** | `--cf-bg`<br>`--cf-surface`<br>`--cf-surface-hover` | `#0d0f14` (Deep background)<br>`#161922` (Card surface)<br>`#1e222e` (Subtle hover state) |
| **Borders** | `--cf-border`<br>`--cf-border-subtle` | `#272c3b` (Divider)<br>`#1f2430` (Subtle header line) |
| **Typography** | `--cf-text-primary`<br>`--cf-text-secondary`<br>`--cf-text-muted` | `#f1f5f9` (High contrast headings)<br>`#94a3b8` (Descriptions)<br>`#64748b` (Meta labels) |
| **Accent & Feedback** | `--cf-accent`<br>`--cf-success`<br>`--cf-warning`<br>`--cf-error` | `#3b82f6` (Primary switch active)<br>`#10b981` (Supported badge)<br>`#f59e0b` (Notice banner)<br>`#ef4444` (Error alert) |
| **Accessibility** | `@media (prefers-reduced-motion)` | Disables transitions and calms spinners for motion-sensitive users. |

---

## 4. Page-Specific Applicability & Route Scopes

Certain rules target specific pages (e.g. YouTube homepage video grid vs. watch page comments):
- **Declarative Scope (`PageScope`)**: Rules declare `scope: 'all' | 'home' | 'watch' | 'feed' | 'post'` and an optional `isApplicable(url: URL): boolean` validator.
- **Preference Preservation**: Navigating away from a watch page to search results does **not** reset the user's preference for "Hide Comments". The preference remains securely saved in `chrome.storage.local`.
- **Contextual Badges**: The popup UI displays non-intrusive badges (`Watch page only`, `Homepage`, etc.) informing the user of where the rule takes effect while keeping the switch accessible.

---

## 5. Safe Hostname Matching

To protect against domain spoofing and deceptive URLs:
```ts
// src/core/registry.ts
// cleanHost === domainRoot || cleanHost.endsWith('.' + domainRoot)
```
- Matches: `youtube.com`, `www.youtube.com`, `m.youtube.com`.
- Rejects: `youtube.com.evil.org`, `fakeyoutube.com`, `notyoutube.com`.

---

## 6. How to Add a New Site Adapter

1. Create `src/adapters/<site>.ts`:
   ```ts
   import { SiteAdapter } from '../core/types';

   export const githubAdapter: SiteAdapter = {
     id: 'github',
     name: 'GitHub',
     matches: ['github.com', '*.github.com'],
     rules: [
       {
         id: 'gh-hide-explore-feed',
         label: 'Hide Explore Feed',
         description: 'Hides trending repositories on the dashboard.',
         defaultEnabled: false,
         scope: 'home',
         selectors: ['#dashboard-feed'],
       },
     ],
   };
   ```
2. Add the adapter to `src/adapters/index.ts`.
3. Add the domain to `host_permissions` and `content_scripts` in `wxt.config.ts`.
4. Run `npm run test` to verify automatic registration, default settings normalization, and selector isolation.
