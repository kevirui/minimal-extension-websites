import { describe, it, expect, beforeEach } from 'vitest';
import { youtubeAdapter } from './youtube';
import { redditAdapter } from './reddit';
import { youtubeHomeFixture, youtubeWatchFixture, redditFeedFixture } from '../test/fixtures';

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

    it('accurately targets homepage recommendation grid while preserving search & navigation', () => {
      const homeFeedRule = youtubeAdapter.rules.find((r) => r.id === 'yt-hide-home-feed');
      expect(homeFeedRule).toBeDefined();

      const combinedSelector = homeFeedRule!.selectors!.join(', ');
      const matched = homeDoc.querySelectorAll(combinedSelector);

      expect(matched.length).toBeGreaterThan(0);
      // Ensure search bar and top masthead are NOT affected
      expect(homeDoc.querySelector('#search')?.matches(combinedSelector)).toBe(false);
      expect(homeDoc.querySelector('#masthead-container')?.matches(combinedSelector)).toBe(false);
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
});
