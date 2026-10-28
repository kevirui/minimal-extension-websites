import { SiteAdapter } from '../core/types';

/**
 * Instagram Site Adapter
 * Provides targeted, independent rules to hide distracting elements on Instagram Web.
 * 
 * Rules:
 * 1. Hide Floating Messages Button: Floating chat pill in bottom-right corner (Scope: all)
 * 2. Hide Right Sidebar Suggestions: User profile summary, suggested for you, and footer links (Scope: home)
 * 3. Hide Left Navigation Buttons: Reels, Search, Create, More, and Also from Meta (Scope: all)
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
      id: 'ig-hide-nav-buttons',
      label: 'Hide Reels, Search, Create, More & Meta',
      description: 'Hides Reels, Search, Create (+), More (menu), and Also from Meta (Threads) buttons from the left navigation bar.',
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
    },
  ],
};
