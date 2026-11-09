import { describe, it, expect, beforeEach } from 'vitest';
import { youtubeAdapter } from './youtube';
import { redditAdapter } from './reddit';
import { instagramAdapter } from './instagram';
import { linkedinAdapter } from './linkedin';
import {
  youtubeHomeFixture,
  youtubeWatchFixture,
  redditFeedFixture,
  instagramHomeFixture,
  linkedinHomeFixture,
} from '../test/fixtures';

describe('Selector Behavior Against Representative DOM Fixtures', () => {
  describe('YouTube Adapter Selectors', () => {
    let homeDoc: Document;
    let watchDoc: Document;

    beforeEach(() => {
      const parser = new DOMParser();
      homeDoc = parser.parseFromString(youtubeHomeFixture, 'text/html');
      watchDoc = parser.parseFromString(youtubeWatchFixture, 'text/html');
    });

    it('accurately identifies Shorts elements without matching organic content', () => {
      const shortsRule = youtubeAdapter.rules.find((r) => r.id === 'yt-hide-shorts');
      expect(shortsRule).toBeDefined();

      const combinedSelector = shortsRule!.selectors!.join(', ');

      // In homeDoc, shorts link and shelf should match
      const matchedHome = homeDoc.querySelectorAll(combinedSelector);
      expect(matchedHome.length).toBeGreaterThan(0);

      // Verify specific elements matched
      const matchedIds = Array.from(matchedHome).map((el) => el.id);
      expect(matchedIds).toContain('shelf-shorts');

      // Verify organic video cards and search are NOT matched
      expect(matchedIds).not.toContain('video-card-1');
      expect(matchedIds).not.toContain('video-card-2');
      expect(matchedIds).not.toContain('search');
    });

    it('accurately targets related videos panel on watch page while preserving the player', () => {
      const relatedRule = youtubeAdapter.rules.find((r) => r.id === 'yt-hide-related-videos');
      expect(relatedRule).toBeDefined();

      const combinedSelector = relatedRule!.selectors!.join(', ');
      const matched = watchDoc.querySelectorAll(combinedSelector);

      expect(matched.length).toBeGreaterThan(0);
      expect(matched[0].id).toBe('related');

      // Player and video details must NOT be matched
      expect(watchDoc.querySelector('#player')?.matches(combinedSelector)).toBe(false);
      expect(watchDoc.querySelector('#above-the-fold')?.matches(combinedSelector)).toBe(false);
    });

    it('accurately targets comments container on watch page', () => {
      const commentsRule = youtubeAdapter.rules.find((r) => r.id === 'yt-hide-comments');
      expect(commentsRule).toBeDefined();

      const combinedSelector = commentsRule!.selectors!.join(', ');
      const matched = watchDoc.querySelectorAll(combinedSelector);

      expect(matched.length).toBeGreaterThan(0);
      expect(matched[0].id).toBe('comments');
      expect(watchDoc.querySelector('#player')?.matches(combinedSelector)).toBe(false);
    });

    it('accurately targets distracting action buttons while preserving like and playlist save', () => {
      const actionsRule = youtubeAdapter.rules.find((r) => r.id === 'yt-clean-watch-actions');
      expect(actionsRule).toBeDefined();

      const combinedSelector = actionsRule!.selectors!.join(', ');
      const matched = watchDoc.querySelectorAll(combinedSelector);

      expect(matched.length).toBeGreaterThan(0);
      const matchedIds = Array.from(matched).map((el) => el.id);
      expect(matchedIds).toContain('share-btn');
      expect(matchedIds).toContain('ask-btn');
      expect(matchedIds).toContain('more-actions-btn');

      // Crucial: Like and Save buttons must NOT be matched
      expect(watchDoc.querySelector('#like-btn')?.matches(combinedSelector)).toBe(false);
      expect(watchDoc.querySelector('#save-btn')?.matches(combinedSelector)).toBe(false);
    });

    it('accurately targets video description elements on watch page', () => {
      const descRule = youtubeAdapter.rules.find((r) => r.id === 'yt-hide-video-description');
      expect(descRule).toBeDefined();

      const combinedSelector = descRule!.selectors!.join(', ');
      const matched = watchDoc.querySelectorAll(combinedSelector);

      expect(matched.length).toBeGreaterThan(0);
      const matchedIds = Array.from(matched).map((el) => el.id);
      expect(matchedIds).toContain('description');
      expect(matchedIds).toContain('desc-expander');

      // Video title and player must not be matched
      expect(watchDoc.querySelector('#above-the-fold')?.matches(combinedSelector)).toBe(false);
    });

    it('provides customCss to center video player on watch page', () => {
      const centerRule = youtubeAdapter.rules.find((r) => r.id === 'yt-center-watch-player');
      expect(centerRule).toBeDefined();
      expect(centerRule?.customCss).toContain('justify-content: center !important;');
      expect(centerRule?.customCss).toContain('ytd-watch-flexy[flexy] #primary');
    });

    it('accurately targets left navigation sidebar elements', () => {
      const sidebarRule = youtubeAdapter.rules.find((r) => r.id === 'yt-hide-sidebar');
      expect(sidebarRule).toBeDefined();
      expect(sidebarRule?.customCss).toContain('margin-left: 0 !important;');

      const combinedSelector = sidebarRule!.selectors!.join(', ');
      const matched = homeDoc.querySelectorAll(combinedSelector);

      expect(matched.length).toBeGreaterThan(0);
      const matchedIds = Array.from(matched).map((el) => el.id);
      expect(matchedIds).toContain('guide');
      expect(matchedIds).toContain('guide-renderer');
      expect(matchedIds).toContain('guide-wrapper');
    });

    it('accurately targets category chips bar on video feeds', () => {
      const catRule = youtubeAdapter.rules.find((r) => r.id === 'yt-hide-categories');
      expect(catRule).toBeDefined();

      const combinedSelector = catRule!.selectors!.join(', ');
      const matched = homeDoc.querySelectorAll(combinedSelector);

      expect(matched.length).toBeGreaterThan(0);
      const matchedIds = Array.from(matched).map((el) => el.id);
      expect(matchedIds).toContain('category-chips');
      expect(matchedIds).toContain('chips-wrapper');
    });

    it('accurately targets mic, create button, notifications bell, and profile icon', () => {
      const btnRule = youtubeAdapter.rules.find((r) => r.id === 'yt-hide-header-buttons');
      expect(btnRule).toBeDefined();

      const combinedSelector = btnRule!.selectors!.join(', ');
      const matched = homeDoc.querySelectorAll(combinedSelector);

      expect(matched.length).toBeGreaterThan(0);
      const matchedIds = Array.from(matched).map((el) => el.id);
      expect(matchedIds).toContain('voice-search-button');
      expect(matchedIds).toContain('create-btn');
      expect(matchedIds).toContain('notification-button');
      expect(matchedIds).toContain('avatar-btn');

      // The search bar must NOT be matched
      expect(homeDoc.querySelector('#search')?.matches(combinedSelector)).toBe(false);
    });
  });

  describe('Reddit Adapter Selectors', () => {
    let redditDoc: Document;

    beforeEach(() => {
      const parser = new DOMParser();
      redditDoc = parser.parseFromString(redditFeedFixture, 'text/html');
    });

    it('accurately targets promoted posts while keeping organic discussion posts visible', () => {
      const promotedRule = redditAdapter.rules.find((r) => r.id === 'reddit-hide-promoted');
      expect(promotedRule).toBeDefined();

      const combinedSelector = promotedRule!.selectors!.join(', ');
      const matched = redditDoc.querySelectorAll(combinedSelector);

      expect(matched.length).toBe(2);
      const matchedIds = Array.from(matched).map((el) => el.id);
      expect(matchedIds).toContain('ad-post-1');
      expect(matchedIds).toContain('ad-post-2');

      // Organic posts MUST NOT be matched
      expect(matchedIds).not.toContain('organic-post-1');
      expect(matchedIds).not.toContain('organic-post-2');
    });

    it('accurately targets recent posts and recommendations sidebar', () => {
      const sidebarRule = redditAdapter.rules.find((r) => r.id === 'reddit-hide-sidebar-recommendations');
      expect(sidebarRule).toBeDefined();

      const combinedSelector = sidebarRule!.selectors!.join(', ');
      const matched = redditDoc.querySelectorAll(combinedSelector);

      expect(matched.length).toBeGreaterThan(0);
      const matchedIds = Array.from(matched).map((el) => el.id);
      expect(matchedIds).toContain('recent-posts-sidebar');
      expect(matchedIds).not.toContain('organic-post-1');
    });
  });

  describe('Instagram Adapter Selectors', () => {
    let igDoc: Document;

    beforeEach(() => {
      const parser = new DOMParser();
      igDoc = parser.parseFromString(instagramHomeFixture, 'text/html');
    });

    it('provides rich customCss for Neo-Dark Minimalist Theme', () => {
      const themeRule = instagramAdapter.rules.find((r) => r.id === 'ig-theme-modern-dark');
      expect(themeRule).toBeDefined();
      expect(themeRule?.customCss).toContain('--cf-ig-bg: #1e1f28 !important;');
      expect(themeRule?.customCss).toContain('--cf-ig-surface-card: #282a36 !important;');
      expect(themeRule?.customCss).toContain('--cf-ig-radius-card: 18px !important;');
    });

    it('accurately targets the bottom-right floating messages button', () => {
      const floatRule = instagramAdapter.rules.find((r) => r.id === 'ig-hide-floating-messages');
      expect(floatRule).toBeDefined();

      const combinedSelector = floatRule!.selectors!.join(', ');
      const matched = igDoc.querySelectorAll(combinedSelector);

      expect(matched.length).toBeGreaterThan(0);
      const matchedIds = Array.from(matched).map((el) => el.id);
      expect(matchedIds).toContain('floating-chat-widget');

      // The standard navigation messages link must NOT be matched
      expect(igDoc.querySelector('#nav-messages')?.matches(combinedSelector)).toBe(false);
    });

    it('accurately targets the right sidebar recommendations and profile container', () => {
      const sidebarRule = instagramAdapter.rules.find((r) => r.id === 'ig-hide-right-sidebar');
      expect(sidebarRule).toBeDefined();
      expect(sidebarRule?.customCss).toContain('justify-content: center !important;');

      const combinedSelector = sidebarRule!.selectors!.join(', ');
      const matched = igDoc.querySelectorAll(combinedSelector);

      expect(matched.length).toBeGreaterThan(0);
      const matchedIds = Array.from(matched).map((el) => el.id);
      expect(matchedIds).toContain('right-sidebar');

      // Organic feed section must NOT be matched
      expect(igDoc.querySelector('#feed-section')?.matches(combinedSelector)).toBe(false);
    });

    it('accurately targets the home feed posts to eliminate doomscrolling in focus mode', () => {
      const feedRule = instagramAdapter.rules.find((r) => r.id === 'ig-hide-feed');
      expect(feedRule).toBeDefined();

      const combinedSelector = feedRule!.selectors!.join(', ');
      const matched = igDoc.querySelectorAll(combinedSelector);

      expect(matched.length).toBeGreaterThan(0);
      const matchedIds = Array.from(matched).map((el) => el.id);
      expect(matchedIds).toContain('feed-section');
      expect(matchedIds).toContain('post-1');
      expect(matchedIds).toContain('post-2');

      // Floating messages and navigation must NOT be matched
      expect(igDoc.querySelector('#nav-home')?.matches(combinedSelector)).toBe(false);
      expect(igDoc.querySelector('#floating-chat-widget')?.matches(combinedSelector)).toBe(false);
    });

    it('accurately targets the top stories carousel tray on home feed', () => {
      const storiesRule = instagramAdapter.rules.find((r) => r.id === 'ig-hide-stories-tray');
      expect(storiesRule).toBeDefined();

      const combinedSelector = storiesRule!.selectors!.join(', ');
      const matched = igDoc.querySelectorAll(combinedSelector);

      expect(matched.length).toBeGreaterThan(0);
      const matchedIds = Array.from(matched).map((el) => el.id);
      expect(matchedIds).toContain('stories-tray-wrapper');

      // Main posts section must NOT be matched
      expect(igDoc.querySelector('#feed-section')?.matches(combinedSelector)).toBe(false);
    });

    it('accurately keeps only Home, Messages, and Profile while hiding Reels, Search, Explore, Notifications, Create, More, and Threads', () => {
      const navRule = instagramAdapter.rules.find((r) => r.id === 'ig-hide-nav-buttons');
      expect(navRule).toBeDefined();
      expect(navRule?.customCss).toContain('width: 220px !important;');
      expect(navRule?.customCss).toContain('visibility: visible !important;');

      const combinedSelector = navRule!.selectors!.join(', ');
      const matched = igDoc.querySelectorAll(combinedSelector);

      expect(matched.length).toBeGreaterThan(0);
      const matchedIds = Array.from(matched).map((el) => el.id);
      expect(matchedIds).toContain('nav-reels');
      expect(matchedIds).toContain('nav-search');
      expect(matchedIds).toContain('nav-explore');
      expect(matchedIds).toContain('nav-notifications');
      expect(matchedIds).toContain('nav-create');
      expect(matchedIds).toContain('nav-more');
      expect(matchedIds).toContain('nav-threads');

      // Crucial: Home, Messages, and Profile MUST NOT be matched
      expect(igDoc.querySelector('#nav-home')?.matches(combinedSelector)).toBe(false);
      expect(igDoc.querySelector('#nav-messages')?.matches(combinedSelector)).toBe(false);
      expect(igDoc.querySelector('#nav-profile')?.matches(combinedSelector)).toBe(false);
    });
  });

  describe('LinkedIn Adapter Selectors (Minimal Theme)', () => {
    let liDoc: Document;

    beforeEach(() => {
      const parser = new DOMParser();
      liDoc = parser.parseFromString(linkedinHomeFixture, 'text/html');
    });

    it('accurately targets the main feed to eliminate doomscrolling', () => {
      const feedRule = linkedinAdapter.rules.find((r) => r.id === 'li-hide-feed');
      expect(feedRule).toBeDefined();

      const combinedSelector = feedRule!.selectors!.join(', ');
      const matched = liDoc.querySelectorAll(combinedSelector);

      expect(matched.length).toBeGreaterThan(0);
      const matchedIds = Array.from(matched).map((el) => el.id);
      expect(matchedIds).toContain('voyager-feed');
      expect(matchedIds).toContain('feed-container');

      // Top nav and sidebars must NOT be matched
      expect(liDoc.querySelector('#nav-home')?.matches(combinedSelector)).toBe(false);
      expect(liDoc.querySelector('#left-sidebar')?.matches(combinedSelector)).toBe(false);
    });

    it('accurately targets promoted posts and standalone ad banners', () => {
      const promotedRule = linkedinAdapter.rules.find((r) => r.id === 'li-hide-promoted');
      expect(promotedRule).toBeDefined();

      const combinedSelector = promotedRule!.selectors!.join(', ');
      const matched = liDoc.querySelectorAll(combinedSelector);

      expect(matched.length).toBeGreaterThan(0);
      const matchedIds = Array.from(matched).map((el) => el.id);
      expect(matchedIds).toContain('promoted-post-1');
      expect(matchedIds).toContain('sidebar-ad');

      // Organic posts MUST NOT be matched
      expect(liDoc.querySelector('#organic-post-1')?.matches(combinedSelector)).toBe(false);
    });

    it('accurately targets right sidebar with news and trends and provides centering CSS', () => {
      const rightRule = linkedinAdapter.rules.find((r) => r.id === 'li-hide-right-sidebar');
      expect(rightRule).toBeDefined();
      expect(rightRule?.customCss).toContain('justify-content: center !important;');

      const combinedSelector = rightRule!.selectors!.join(', ');
      const matched = liDoc.querySelectorAll(combinedSelector);

      expect(matched.length).toBeGreaterThan(0);
      const matchedIds = Array.from(matched).map((el) => el.id);
      expect(matchedIds).toContain('right-sidebar');
      expect(matchedIds).toContain('news-widget');

      // Main column must NOT be matched
      expect(liDoc.querySelector('#main-column')?.matches(combinedSelector)).toBe(false);
    });

    it('accurately targets left profile & analytics sidebar', () => {
      const leftRule = linkedinAdapter.rules.find((r) => r.id === 'li-hide-left-sidebar');
      expect(leftRule).toBeDefined();

      const combinedSelector = leftRule!.selectors!.join(', ');
      const matched = liDoc.querySelectorAll(combinedSelector);

      expect(matched.length).toBeGreaterThan(0);
      const matchedIds = Array.from(matched).map((el) => el.id);
      expect(matchedIds).toContain('left-sidebar');
      expect(matchedIds).toContain('identity-card');
    });

    it('accurately targets the persistent floating messaging popup', () => {
      const msgRule = linkedinAdapter.rules.find((r) => r.id === 'li-hide-floating-messages');
      expect(msgRule).toBeDefined();

      const combinedSelector = msgRule!.selectors!.join(', ');
      const matched = liDoc.querySelectorAll(combinedSelector);

      expect(matched.length).toBeGreaterThan(0);
      const matchedIds = Array.from(matched).map((el) => el.id);
      expect(matchedIds).toContain('msg-overlay');

      // Navigation Messaging link must NOT be matched
      expect(liDoc.querySelector('#nav-messaging')?.matches(combinedSelector)).toBe(false);
    });

    it('accurately targets top navigation upsells and business launcher', () => {
      const navRule = linkedinAdapter.rules.find((r) => r.id === 'li-clean-nav-header');
      expect(navRule).toBeDefined();

      const combinedSelector = navRule!.selectors!.join(', ');
      const matched = liDoc.querySelectorAll(combinedSelector);

      expect(matched.length).toBeGreaterThan(0);
      const matchedIds = Array.from(matched).map((el) => el.id);
      expect(matchedIds).toContain('nav-premium');
      expect(matchedIds).toContain('nav-business');

      // Primary navigation items (Home, Network, Jobs, Messaging) must NOT be matched
      expect(liDoc.querySelector('#nav-home')?.matches(combinedSelector)).toBe(false);
      expect(liDoc.querySelector('#nav-network')?.matches(combinedSelector)).toBe(false);
      expect(liDoc.querySelector('#nav-jobs')?.matches(combinedSelector)).toBe(false);
      expect(liDoc.querySelector('#nav-messaging')?.matches(combinedSelector)).toBe(false);
    });
  });
});
