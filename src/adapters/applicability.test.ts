import { describe, it, expect } from 'vitest';
import { youtubeAdapter } from './youtube';
import { redditAdapter } from './reddit';

describe('Site Rules Scope and Route Applicability', () => {
  describe('YouTube Rules Applicability', () => {
    const shortsRule = youtubeAdapter.rules.find((r) => r.id === 'yt-hide-shorts')!;
    const homeFeedRule = youtubeAdapter.rules.find((r) => r.id === 'yt-hide-home-feed')!;
    const relatedRule = youtubeAdapter.rules.find((r) => r.id === 'yt-hide-related-videos')!;
    const commentsRule = youtubeAdapter.rules.find((r) => r.id === 'yt-hide-comments')!;

    it('declares valid rule metadata and non-empty descriptions', () => {
      for (const rule of youtubeAdapter.rules) {
        expect(rule.id).toBeTruthy();
        expect(rule.label).toBeTruthy();
        expect(rule.description).toBeTruthy();
        expect(typeof rule.defaultEnabled).toBe('boolean');
        expect(rule.selectors?.length).toBeGreaterThan(0);
      }
    });

    it('evaluates rule route applicability accurately across routes', () => {
      const homeUrl = new URL('https://www.youtube.com/');
      const watchUrl = new URL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      const searchUrl = new URL('https://www.youtube.com/results?search_query=music');

      // Shorts is global ('all' scope)
      expect(shortsRule.scope).toBe('all');

      // Home recommendations apply only on home page
      expect(homeFeedRule.scope).toBe('home');
      expect(homeFeedRule.isApplicable!(homeUrl)).toBe(true);
      expect(homeFeedRule.isApplicable!(watchUrl)).toBe(false);
      expect(homeFeedRule.isApplicable!(searchUrl)).toBe(false);

      // Related videos apply on watch pages
      expect(relatedRule.scope).toBe('watch');
      expect(relatedRule.isApplicable!(watchUrl)).toBe(true);
      expect(relatedRule.isApplicable!(homeUrl)).toBe(false);

      // Comments apply on watch pages
      expect(commentsRule.scope).toBe('watch');
      expect(commentsRule.isApplicable!(watchUrl)).toBe(true);
      expect(commentsRule.isApplicable!(homeUrl)).toBe(false);
    });
  });

  describe('Reddit Rules Applicability', () => {
    const promotedRule = redditAdapter.rules.find((r) => r.id === 'reddit-hide-promoted')!;
    const sidebarRule = redditAdapter.rules.find((r) => r.id === 'reddit-hide-sidebar-recommendations')!;

    it('declares valid rule metadata for Reddit rules', () => {
      for (const rule of redditAdapter.rules) {
        expect(rule.id).toBeTruthy();
        expect(rule.label).toBeTruthy();
        expect(rule.description).toBeTruthy();
        expect(typeof rule.defaultEnabled).toBe('boolean');
        expect(rule.selectors?.length).toBeGreaterThan(0);
      }
    });

    it('evaluates Reddit rule applicability across feed and discussion routes', () => {
      const homeFeed = new URL('https://www.reddit.com/');
      const subFeed = new URL('https://www.reddit.com/r/technology/');
      const commentsPage = new URL('https://www.reddit.com/r/technology/comments/123/great_discussion/');

      expect(promotedRule.scope).toBe('all');

      // Sidebar recommendations applies on feeds
      expect(sidebarRule.scope).toBe('feed');
      expect(sidebarRule.isApplicable!(homeFeed)).toBe(true);
      expect(sidebarRule.isApplicable!(subFeed)).toBe(true);
      expect(sidebarRule.isApplicable!(commentsPage)).toBe(false);
    });
  });
});
