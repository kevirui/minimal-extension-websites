import { SiteAdapter } from '../core/types';

/**
 * Reddit Site Adapter
 * Provides targeted rules to hide promotional, recommendation, and distraction components on Reddit.
 * 
 * Rules:
 * 1. Hide Promoted posts and banner advertisements across feeds (Scope: all)
 * 2. Hide "Recent Posts" / trending right-hand sidebar widget (Scope: feed)
 */
export const redditAdapter: SiteAdapter = {
  id: 'reddit',
  name: 'Reddit',
  matches: [
    'reddit.com',
    '*.reddit.com',
  ],
  rules: [
    {
      id: 'reddit-hide-promoted',
      label: 'Hide Promoted Posts & Ads',
      description: 'Hides sponsored posts and promoted banner cards in subreddit and home feeds.',
      defaultEnabled: true,
      scope: 'all',
      selectors: [
        // Modern Reddit (shreddit) promoted posts and ads
        'shreddit-ad-post',
        'shreddit-dynamic-ad-link',
        'div[data-testid="ad-post"]',
        // New Reddit / redesign promoted units
        'div[data-promoted="true"]',
        '.promotedlink',
        // Old Reddit sponsored links
        '.thing.promoted',
        '.thing.sponsor',
      ],
    },
    {
      id: 'reddit-hide-sidebar-recommendations',
      label: 'Hide Recent Posts & Recommendations',
      description: 'Hides the "Recent Posts" drawer and algorithmic recommendation sidebars.',
      defaultEnabled: false,
      scope: 'feed',
      isApplicable: (url: URL) => !url.pathname.includes('/comments/'),
      selectors: [
        // Modern Reddit recent posts section
        'shreddit-recent-posts',
        'aside[aria-label="Recent Posts"]',
        '#recent-posts-card',
        // Recommended communities widget
        'shreddit-feed-carousel[data-testid="recommended-carousel"]',
      ],
    },
  ],
};
