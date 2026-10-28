import { SiteAdapter } from '../core/types';

/**
 * YouTube Site Adapter
 * Provides targeted, independent rules to hide distracting elements on YouTube.
 * 
 * Rules:
 * 1. Hide Shorts: Navigation drawer link, guide bar, shelf, and tabs (Scope: all)
 * 2. Hide Left Sidebar: Collapses guide drawer and centers home video grid (Scope: all)
 * 3. Hide Video Categories: Hides topic chip category bar at top of video feed (Scope: home)
 * 4. Hide Header Action Buttons: Hides mic, create button, notifications bell, and profile icon (Scope: all)
 * 5. Hide Related Videos: Recommendations panel on watch page (Scope: watch)
 * 6. Hide Comments: Comments section beneath video player (Scope: watch)
 */
export const youtubeAdapter: SiteAdapter = {
  id: 'youtube',
  name: 'YouTube',
  matches: [
    'youtube.com',
    '*.youtube.com',
  ],
  rules: [
    {
      id: 'yt-hide-shorts',
      label: 'Hide Shorts',
      description: 'Hides Shorts entry points, navigation tab, and recommendation reels across home and search.',
      defaultEnabled: true,
      scope: 'all',
      selectors: [
        // Sidebar / Guide drawer Shorts link
        'ytd-guide-entry-renderer:has(a[title="Shorts"])',
        'ytd-guide-entry-renderer:has(a[href^="/shorts"])',
        'ytd-mini-guide-entry-renderer:has(a[title="Shorts"])',
        'ytd-mini-guide-entry-renderer:has(a[href^="/shorts"])',
        // Feed shorts shelves (grid and rich shelf)
        'ytd-rich-shelf-renderer[is-shorts]',
        'ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])',
        'ytd-reel-shelf-renderer',
        // Channel page shorts tab
        'yt-tab-shape[tab-title="Shorts"]',
        // Mobile web YouTube Shorts elements
        'ytm-reel-shelf-renderer',
        'ytm-pivot-bar-item-renderer:has(div.pivot-shorts)',
      ],
    },
    {
      id: 'yt-hide-sidebar',
      label: 'Hide Left Sidebar',
      description: 'Hides the guide navigation sidebar and cleanly centers the homepage video recommendations grid.',
      defaultEnabled: false,
      scope: 'all',
      selectors: [
        'ytd-guide-renderer#guide-renderer',
        '#guide-wrapper',
        'tp-yt-app-drawer#guide',
        'ytd-mini-guide-renderer',
        '#guide-content',
      ],
      customCss: `
/* Clear left margin/padding that YouTube reserves for the sidebar */
ytd-page-manager#page-manager {
  margin-left: 0 !important;
}
ytd-app[mini-guide-visible] ytd-page-manager#page-manager {
  margin-left: 0 !important;
}
/* Center the main rich grid container */
ytd-browse[page-subtype="home"] ytd-rich-grid-renderer {
  margin-left: auto !important;
  margin-right: auto !important;
  max-width: 1400px !important;
  justify-content: center !important;
}
ytd-browse[page-subtype="home"] #contents.ytd-rich-grid-renderer {
  justify-content: center !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
`,
    },
    {
      id: 'yt-hide-categories',
      label: 'Hide Video Categories',
      description: 'Hides the topic chip filter bar (All, Gaming, Music, Podcasts, etc.) above videos.',
      defaultEnabled: false,
      scope: 'home',
      isApplicable: (url: URL) => url.pathname === '/' || url.pathname === '',
      selectors: [
        'ytd-feed-filter-chip-bar-renderer',
        '#chips-wrapper',
        'yt-chip-cloud-renderer',
        'iron-selector#chips',
        'ytm-feed-filter-chip-bar-renderer',
      ],
    },
    {
      id: 'yt-hide-header-buttons',
      label: 'Hide Header Buttons',
      description: 'Hides voice search (mic), Create button (+), notifications bell, and profile avatar in the top bar.',
      defaultEnabled: false,
      scope: 'all',
      selectors: [
        // Voice search mic button next to search bar
        '#voice-search-button',
        'ytd-masthead #voice-search-button',
        // Top right "+ Create" button
        'ytd-masthead ytd-button-renderer:has(a[href*="/upload"])',
        'ytd-masthead ytd-button-renderer:has(button[aria-label*="Create"])',
        'ytd-masthead ytd-button-renderer:has(button[aria-label*="Crear"])',
        'ytd-masthead yt-icon-button:has(button[aria-label*="Create"])',
        'ytd-masthead #buttons ytd-button-renderer:first-child',
        // Notifications bell
        'ytd-masthead ytd-notification-topbar-button-renderer',
        'ytd-masthead #notification-button',
        // User profile avatar button
        'ytd-masthead ytd-topbar-menu-button-renderer:has(#avatar-btn)',
        'ytd-masthead #avatar-btn',
      ],
    },
    {
      id: 'yt-clean-watch-actions',
      label: 'Clean Video Action Buttons',
      description: 'Keeps only Subscribe, Like, and Save to Playlist. Hides Share, Remix, Thanks, Clip, Download, and extra buttons.',
      defaultEnabled: false,
      scope: 'watch',
      isApplicable: (url: URL) => url.pathname === '/watch',
      selectors: [
        // Share button
        '#actions button[aria-label*="Share" i]',
        '#actions button[aria-label*="Compartir" i]',
        '#actions ytd-button-renderer:has(button[aria-label*="Share" i])',
        '#actions ytd-button-renderer:has(button[aria-label*="Compartir" i])',
        // AI / Ask button
        '#actions button[aria-label*="Ask" i]',
        '#actions button[aria-label*="Preguntar" i]',
        '#actions ytd-button-renderer:has(button[aria-label*="Ask" i])',
        '#actions yt-button-view-model:has(button[aria-label*="Ask" i])',
        // Remix button
        '#actions button[aria-label*="Remix" i]',
        '#actions ytd-button-renderer:has(button[aria-label*="Remix" i])',
        // Thanks / Super Thanks button
        '#actions button[aria-label*="Thanks" i]',
        '#actions button[aria-label*="Gracias" i]',
        '#actions ytd-button-renderer:has(button[aria-label*="Thanks" i])',
        // Clip button
        '#actions button[aria-label*="Clip" i]',
        '#actions ytd-button-renderer:has(button[aria-label*="Clip" i])',
        // Download button
        '#actions button[aria-label*="Download" i]',
        '#actions button[aria-label*="Descargar" i]',
        '#actions ytd-download-button-renderer',
        '#actions ytd-button-renderer:has(button[aria-label*="Download" i])',
        // More actions overflow button (...)
        '#actions ytd-menu-renderer ytd-popup-button-renderer',
        '#actions yt-button-shape:has(button[aria-label*="More actions" i])',
        '#actions yt-button-shape:has(button[aria-label*="Más acciones" i])',
      ],
    },
    {
      id: 'yt-hide-video-description',
      label: 'Hide Video Description',
      description: 'Hides the description box and expandable details below the video title and actions.',
      defaultEnabled: false,
      scope: 'watch',
      isApplicable: (url: URL) => url.pathname === '/watch',
      selectors: [
        'ytd-watch-metadata #description',
        'ytd-watch-metadata #description-inner',
        '#meta #description',
        'ytd-expander.ytd-video-secondary-info-renderer',
        'ytd-text-inline-expander',
        'ytm-item-section-renderer[section-identifier="video-description"]',
      ],
    },
    {
      id: 'yt-center-watch-player',
      label: 'Center Video Player & Minimalist Layout',
      description: 'Centers the video player and watch content cleanly when recommendations are hidden or for a focused theater feel.',
      defaultEnabled: false,
      scope: 'watch',
      isApplicable: (url: URL) => url.pathname === '/watch',
      selectors: [],
      customCss: `
/* Center player and main watch columns cleanly */
ytd-watch-flexy[flexy] #columns {
  display: flex !important;
  justify-content: center !important;
  margin: 0 auto !important;
  max-width: 1400px !important;
}
ytd-watch-flexy[flexy] #primary {
  margin: 0 auto !important;
  float: none !important;
  max-width: 1200px !important;
}
ytd-watch-flexy[flexy] #primary-inner {
  margin: 0 auto !important;
}
ytd-watch-grid #primary {
  margin: 0 auto !important;
  max-width: 1200px !important;
}
`,
    },
    {
      id: 'yt-hide-related-videos',
      label: 'Hide Related Videos on Watch Page',
      description: 'Hides the secondary sidebar of recommended videos on video watch pages.',
      defaultEnabled: false,
      scope: 'watch',
      isApplicable: (url: URL) => url.pathname === '/watch',
      selectors: [
        // Desktop watch page secondary sidebar containing related videos
        'ytd-watch-flexy #secondary #related',
        'ytd-watch-grid #secondary #related',
        '#related.ytd-watch-flexy',
        // Mobile watch page related items
        'ytm-item-section-renderer[section-identifier="related-items"]',
      ],
    },
    {
      id: 'yt-hide-comments',
      label: 'Hide Comments',
      description: 'Hides the comments section on video watch pages.',
      defaultEnabled: false,
      scope: 'watch',
      isApplicable: (url: URL) => url.pathname === '/watch',
      selectors: [
        // Desktop comments container
        'ytd-comments#comments',
        '#comments.ytd-watch-flexy',
        '#comments.ytd-watch-grid',
        // Mobile comments teaser and sheet
        'ytm-comments-entry-point-teaser-renderer',
        'ytm-comment-section-renderer',
      ],
    },
  ],
};
