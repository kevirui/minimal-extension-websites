import { SiteAdapter } from '../core/types';

/**
 * Instagram Site Adapter
 * Provides targeted, independent rules to hide distracting elements on Instagram Web.
 * 
 * Rules:
 * 1. Hide Floating Messages Button: Floating chat pill in bottom-right corner (Scope: all)
 * 2. Hide Right Sidebar Suggestions: User profile summary, suggested for you, and footer links (Scope: home)
 * 3. Hide Stories Tray: Removes top stories carousel tray on home feed (Scope: home)
 * 4. Simplify Navigation (Home, Messages & Profile Only): Keeps only Home, Messages, and Profile, hides all others, and forces labels to remain visible (Scope: all)
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
