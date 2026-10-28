import { describe, it, expect } from 'vitest';
import { youtubeAdapter } from './youtube';
import { redditAdapter } from './reddit';
import { instagramAdapter } from './instagram';

describe('Site Rules Scope and Route Applicability', () => {
  describe('YouTube Rules Applicability', () => {
    const shortsRule = youtubeAdapter.rules.find((r) => r.id === 'yt-hide-shorts')!;
    const relatedRule = youtubeAdapter.rules.find((r) => r.id === 'yt-hide-related-videos')!;
    const commentsRule = youtubeAdapter.rules.find((r) => r.id === 'yt-hide-comments')!;

    it('declares valid rule metadata and non-empty descriptions', () => {
      for (const rule of youtubeAdapter.rules) {
        expect(rule.id).toBeTruthy();
        expect(rule.label).toBeTruthy();
        expect(rule.description).toBeTruthy();
        expect(typeof rule.defaultEnabled).toBe('boolean');
        expect((rule.selectors?.length ?? 0) > 0 || !!rule.customCss).toBe(true);
      }
    });

    it('evaluates rule route applicability accurately across routes', () => {
      const homeUrl = new URL('https://www.youtube.com/');
      const watchUrl = new URL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

      // Shorts is global ('all' scope)
      expect(shortsRule.scope).toBe('all');

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

  describe('Instagram Rules Applicability', () => {
    const floatingRule = instagramAdapter.rules.find((r) => r.id === 'ig-hide-floating-messages')!;
    const sidebarRule = instagramAdapter.rules.find((r) => r.id === 'ig-hide-right-sidebar')!;
    const navRule = instagramAdapter.rules.find((r) => r.id === 'ig-hide-nav-buttons')!;

    it('declares valid rule metadata for Instagram rules', () => {
      for (const rule of instagramAdapter.rules) {
        expect(rule.id).toBeTruthy();
        expect(rule.label).toBeTruthy();
        expect(rule.description).toBeTruthy();
        expect(typeof rule.defaultEnabled).toBe('boolean');
        expect((rule.selectors?.length ?? 0) > 0 || !!rule.customCss).toBe(true);
      }
    });

    it('evaluates Instagram rule applicability across home feed and other routes', () => {
      const homeFeed = new URL('https://www.instagram.com/');
      const explorePage = new URL('https://www.instagram.com/explore/');

      expect(floatingRule.scope).toBe('all');
      expect(navRule.scope).toBe('all');

      // Right sidebar recommendations applies on home feed
      expect(sidebarRule.scope).toBe('home');
      expect(sidebarRule.isApplicable!(homeFeed)).toBe(true);
      expect(sidebarRule.isApplicable!(explorePage)).toBe(false);
    });
  });
});
