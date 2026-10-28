import { SiteAdapter } from '../core/types';

/**
 * YouTube Site Adapter
 * Provides targeted, independent rules to hide distracting elements on YouTube.
 * 
 * Rules:
 * 1. Hide Shorts: Navigation drawer link, guide bar, shelf, and tabs (Scope: all)
 * 2. Hide Home Recommendations: Algorithmic feed on homepage (Scope: home)
 * 3. Hide Related Videos: Recommendations panel on watch page (Scope: watch)
 * 4. Hide Comments: Comments section beneath video player (Scope: watch)
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
      id: 'yt-hide-home-feed',
      label: 'Hide Home Recommendations',
      description: 'Hides the algorithmic video grid on the homepage while preserving search and top navigation.',
      defaultEnabled: false,
      scope: 'home',
      isApplicable: (url: URL) => url.pathname === '/' || url.pathname === '',
      selectors: [
        // Desktop YouTube homepage primary grid
        'ytd-browse[page-subtype="home"] #contents.ytd-rich-grid-renderer',
        'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer',
        // Mobile web YouTube home feed
        'ytm-browse[page-subtype="home"] .tab-content',
      ],
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
