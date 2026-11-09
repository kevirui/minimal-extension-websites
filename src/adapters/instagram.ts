import { SiteAdapter } from '../core/types';

/**
 * Instagram Site Adapter
 * Provides targeted, independent rules and a sleek modern dark theme ("Neo-Dark Dashboard")
 * inspired by minimalist desktop UI concepts.
 * 
 * Rules:
 * 1. ig-theme-modern-dark: Neo-Dark Dashboard Theme (Slate/indigo dark cards, rounded corners, clean glow, grid feed layout)
 * 2. ig-hide-floating-messages: Floating chat pill in bottom-right corner (Scope: all)
 * 3. ig-hide-right-sidebar: User profile summary, suggested for you, and footer links (Scope: home)
 * 4. ig-hide-feed: Removes feed posts for deep focus mode (Scope: home)
 * 5. ig-hide-stories-tray: Removes top stories carousel tray on home feed (Scope: home)
 * 6. ig-hide-nav-buttons: Keeps only essential navigation items and labels (Scope: all)
 */
export const instagramAdapter: SiteAdapter = {
  id: 'instagram',
  name: 'Instagram',
  matches: [
    'instagram.com',
    '*.instagram.com',
  ],
  rules: [
    {
      id: 'ig-theme-modern-dark',
      label: 'Neo-Dark Minimalist Theme',
      description: 'Applies a sleek, dark slate & indigo aesthetic with rounded cards, custom stories glow, streamlined top bar, and modern typography.',
      defaultEnabled: false,
      scope: 'all',
      selectors: [],
      customCss: `
/* ============================================================
   ClearFrame — Instagram Neo-Dark Dashboard Theme
   ============================================================ */

:root {
  --cf-ig-bg: #1e1f28 !important;
  --cf-ig-surface: #272834 !important;
  --cf-ig-surface-hover: #313342 !important;
  --cf-ig-surface-card: #282a36 !important;
  --cf-ig-sidebar: #22232e !important;
  --cf-ig-border: #323545 !important;
  --cf-ig-text-main: #f0f2f5 !important;
  --cf-ig-text-muted: #8d92a3 !important;
  --cf-ig-accent: #ff5e62 !important;
  --cf-ig-accent-gradient: linear-gradient(135deg, #ff5e62, #ff9966) !important;
  --cf-ig-story-gradient: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%) !important;
  --cf-ig-radius-card: 18px !important;
  --cf-ig-radius-btn: 12px !important;
}

/* Background & Main Body Canvas */
html,
body,
div#mount_0_0_*,
div[id^="mount_0_0"] {
  background-color: var(--cf-ig-bg) !important;
  color: var(--cf-ig-text-main) !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
}

/* Base text color overrides */
body *,
span,
p,
h1,
h2,
h3,
h4,
a {
  color: var(--cf-ig-text-main);
}

/* Navigation Left Rail (Neo-Dark Sidebar) */
div[role="navigation"],
nav[role="navigation"],
nav {
  background-color: var(--cf-ig-sidebar) !important;
  border-right: 1px solid var(--cf-ig-border) !important;
}

/* Sidebar navigation links */
nav a,
nav div[role="button"] {
  border-radius: var(--cf-ig-radius-btn) !important;
  transition: all 0.15s ease !important;
  color: var(--cf-ig-text-muted) !important;
}

nav a:hover,
nav div[role="button"]:hover {
  background-color: var(--cf-ig-surface-hover) !important;
  color: #ffffff !important;
}

/* Active or focused navigation item with coral accent indicator */
nav a[aria-current="page"],
nav a[href="/"]:not([href*="/explore"]):not([href*="/direct"]) {
  color: #ffffff !important;
  font-weight: 600 !important;
}

/* Main Content Container & Spacing */
main[role="main"] {
  background-color: var(--cf-ig-bg) !important;
  padding-top: 16px !important;
}

/* Post Cards & Articles (Neo-Dark Rounded Container) */
main[role="main"] article,
article[role="presentation"],
article {
  background-color: var(--cf-ig-surface-card) !important;
  border: 1px solid var(--cf-ig-border) !important;
  border-radius: var(--cf-ig-radius-card) !important;
  overflow: hidden !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25) !important;
  margin-bottom: 24px !important;
}

/* Article media rounded corners */
main[role="main"] article img,
main[role="main"] article video,
main[role="main"] article div[role="button"] img {
  border-radius: 12px !important;
}

/* Header inside article */
main[role="main"] article header {
  background-color: transparent !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  padding: 12px 16px !important;
}

/* Stories Tray: Modern Rounded Carousel Header */
main div[role="menu"],
main div:has(> ul li div[aria-label*="story" i]),
main div:has(> ul li div[aria-label*="historia" i]),
#stories-tray-wrapper,
#stories-tray {
  background-color: var(--cf-ig-surface) !important;
  border: 1px solid var(--cf-ig-border) !important;
  border-radius: var(--cf-ig-radius-card) !important;
  padding: 14px 18px !important;
  margin-bottom: 24px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18) !important;
}

/* Story Rings Glow */
main div[role="menu"] canvas,
main div:has(> ul li div[aria-label*="story" i]) canvas {
  filter: drop-shadow(0 2px 8px rgba(255, 94, 98, 0.4)) !important;
}

/* Right Sidebar (Suggestions & Profile Widget) */
div[role="complementary"],
aside,
#right-sidebar {
  background-color: var(--cf-ig-surface) !important;
  border: 1px solid var(--cf-ig-border) !important;
  border-radius: var(--cf-ig-radius-card) !important;
  padding: 18px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18) !important;
}

/* Input & Search Boxes */
input[type="text"],
input[type="search"],
input[placeholder*="Search" i],
input[placeholder*="Buscar" i] {
  background-color: var(--cf-ig-surface) !important;
  border: 1px solid var(--cf-ig-border) !important;
  border-radius: 20px !important;
  color: #ffffff !important;
  padding: 8px 16px !important;
}

input::placeholder {
  color: var(--cf-ig-text-muted) !important;
}

/* Modern Gradient Buttons ("Add photo" style) */
button[type="button"]:has(span:contains("Follow")),
button:has(div:contains("Follow")),
button:has(div:contains("Seguir")),
button[type="submit"] {
  background: var(--cf-ig-accent-gradient) !important;
  color: #ffffff !important;
  border: none !important;
  border-radius: var(--cf-ig-radius-btn) !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 14px rgba(255, 94, 98, 0.35) !important;
  transition: transform 0.15s ease, box-shadow 0.15s ease !important;
}

button[type="button"]:has(span:contains("Follow")):hover,
button:has(div:contains("Follow")):hover,
button[type="submit"]:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 18px rgba(255, 94, 98, 0.5) !important;
}

/* Floating Messages Neo-Dark Pill */
div[data-pagelet="IGDChatTabsRootContent"],
#floating-chat-widget {
  background-color: var(--cf-ig-surface) !important;
  border: 1px solid var(--cf-ig-border) !important;
  border-radius: 16px !important;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4) !important;
}
`,
    },
    {
      id: 'ig-hide-floating-messages',
      label: 'Hide Floating Messages Button',
      description: 'Hides the floating chat / messages button in the bottom right corner.',
      defaultEnabled: false,
      scope: 'all',
      selectors: [
        // Instagram Web floating chat container
        '[data-pagelet="IGDChatTabsRootContent"]',
        'div:has(> [data-pagelet="IGDChatTabsRootContent"])',
        // Bottom-right floating message button pills
        'div[role="button"]:has(svg[aria-label*="Messages" i])',
        'div[role="button"]:has(svg[aria-label*="Mensajes" i])',
        'div:has(> div > div > svg[aria-label*="Direct" i]):not(nav div)',
      ],
    },
    {
      id: 'ig-hide-right-sidebar',
      label: 'Hide Right Sidebar (Suggestions & Profile)',
      description: 'Hides the entire right-hand column with profile switch, suggested for you, and footer links, centering the main feed.',
      defaultEnabled: false,
      scope: 'home',
      isApplicable: (url: URL) => url.pathname === '/' || url.pathname === '',
      selectors: [
        // Role complementary / aside containers on feed
        'div[role="complementary"]',
        'aside',
        'main ~ div:has(a[href*="/explore/people/"])',
        'main > div > div > div > div ~ div:has(a[href*="/explore/people/"])',
        'main > div > div > div ~ div:has(a[href*="/explore/people/"])',
      ],
      customCss: `
/* Center main feed when right sidebar is hidden */
main[role="main"] {
  display: flex !important;
  justify-content: center !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
main[role="main"] > div {
  margin-left: auto !important;
  margin-right: auto !important;
  justify-content: center !important;
}
main[role="main"] section {
  margin-left: auto !important;
  margin-right: auto !important;
}
`,
    },
    {
      id: 'ig-hide-feed',
      label: 'Hide Algorithmic Feed (Focus Mode)',
      description: 'Hides the home feed posts to eliminate doomscrolling while keeping direct messages and profile accessible.',
      defaultEnabled: false,
      scope: 'home',
      isApplicable: (url: URL) => url.pathname === '/' || url.pathname === '',
      selectors: [
        'main[role="main"] section article',
        'main[role="main"] article[role="presentation"]',
        'main[role="main"] div:has(> article)',
        '#feed-section',
      ],
    },
    {
      id: 'ig-hide-stories-tray',
      label: 'Hide Stories Tray',
      description: 'Hides the top horizontal stories panel (stories bubbles carousel) on the home feed.',
      defaultEnabled: false,
      scope: 'home',
      isApplicable: (url: URL) => url.pathname === '/' || url.pathname === '',
      selectors: [
        // Top stories tray / carousel container
        'div[role="menu"][aria-label*="Stories" i]',
        'div[role="menu"][aria-label*="Historias" i]',
        'main div[role="menu"]',
        'main div:has(> div > div > div > ul li div[aria-label*="story" i])',
        'main div:has(> div > div > div > ul li div[aria-label*="historia" i])',
        'main div:has(> div > ul > li > div[aria-label*="story" i])',
        'main div:has(> div > ul > li > div[aria-label*="historia" i])',
        '#stories-tray-wrapper',
        '#stories-tray',
      ],
    },
    {
      id: 'ig-hide-nav-buttons',
      label: 'Simplify Navigation (Home, Messages & Profile Only)',
      description: 'Keeps only Home, Messages, and Profile visible in the sidebar, hides all other items, and keeps labels permanently visible.',
      defaultEnabled: false,
      scope: 'all',
      selectors: [
        // Reels button
        'nav a[href^="/reels/"]',
        'nav div:has(> a[href^="/reels/"])',
        'a[href^="/reels/"]:has(svg)',
        // Search button / trigger
        'nav div:has(> div > svg[aria-label*="Search" i])',
        'nav div:has(> div > svg[aria-label*="Buscar" i])',
        'nav a:has(svg[aria-label*="Search" i])',
        'nav a:has(svg[aria-label*="Buscar" i])',
        'nav div[role="button"]:has(svg[aria-label*="Search" i])',
        // Explore button
        'nav a[href^="/explore/"]',
        'nav div:has(> a[href^="/explore/"])',
        'nav a:has(svg[aria-label*="Explore" i])',
        'nav a:has(svg[aria-label*="Explorar" i])',
        // Notifications button (heart)
        'nav a:has(svg[aria-label*="Notifications" i])',
        'nav a:has(svg[aria-label*="Notificaciones" i])',
        'nav div:has(> div > svg[aria-label*="Notifications" i])',
        'nav div:has(> div > svg[aria-label*="Notificaciones" i])',
        'nav div[role="button"]:has(svg[aria-label*="Notifications" i])',
        'nav div[role="button"]:has(svg[aria-label*="Notificaciones" i])',
        // Create button (+)
        'nav div:has(> div > svg[aria-label*="New post" i])',
        'nav div:has(> div > svg[aria-label*="Create" i])',
        'nav div:has(> div > svg[aria-label*="Crear" i])',
        'nav div:has(> div > svg[aria-label*="Publicación nueva" i])',
        'nav a:has(svg[aria-label*="New post" i])',
        'nav a:has(svg[aria-label*="Create" i])',
        'nav div[role="button"]:has(svg[aria-label*="New post" i])',
        'nav div[role="button"]:has(svg[aria-label*="Create" i])',
        // More button (hamburger)
        'nav div:has(> div > svg[aria-label*="Settings" i])',
        'nav div:has(> div > svg[aria-label*="More" i])',
        'nav div:has(> div > svg[aria-label*="Más" i])',
        'nav div:has(> div > svg[aria-label*="Opciones" i])',
        'nav div[role="button"]:has(svg[aria-label*="Settings" i])',
        'nav div[role="button"]:has(svg[aria-label*="More" i])',
        'nav div[role="button"]:has(svg[aria-label*="Más" i])',
        // Also from Meta / Threads
        'nav a[href*="threads.net"]',
        'nav div:has(> a[href*="threads.net"])',
        'nav a:has(svg[aria-label*="Threads" i])',
        'nav div:has(> div > svg[aria-label*="Threads" i])',
        'nav div:has(> div > svg[aria-label*="Also from Meta" i])',
        'nav div:has(> div > svg[aria-label*="De Meta" i])',
      ],
      customCss: `
/* Force navigation sidebar width and keep text labels permanently visible */
div[role="navigation"],
nav[role="navigation"],
nav {
  width: 220px !important;
  min-width: 220px !important;
}

/* Ensure text spans inside sidebar are always displayed */
div[role="navigation"] span,
nav span {
  display: inline-block !important;
  opacity: 1 !important;
  visibility: visible !important;
}
`,
    },
  ],
};
