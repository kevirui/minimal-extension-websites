import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateSelectorCandidates,
  analyzeElement,
  isCriticalElement,
  isDynamicId,
  isDynamicClass,
} from './inspectorAnalyzer';

describe('Inspector Analyzer & Selector Generator', () => {
  let doc: Document;

  beforeEach(() => {
    const parser = new DOMParser();
    doc = parser.parseFromString(
      `<!DOCTYPE html>
      <html>
        <head><title>Test</title></head>
        <body>
          <header id="main-header" class="site-header">
            <nav role="navigation" aria-label="Main Navigation">
              <button data-testid="profile-btn" class="nav-item">Profile</button>
            </nav>
          </header>
          <main id="content">
            <div id="feed-container" role="list">
              <article class="feed-post" data-testid="post-card" aria-label="Post 1">
                <span class="post-title">First Post</span>
              </article>
              <article class="feed-post" data-testid="post-card" aria-label="Post 2">
                <span class="post-title">Second Post</span>
              </article>
            </div>
            <aside class="sidebar-news" role="complementary" aria-label="Trending News">
              <div class="news-item">Breaking News</div>
            </aside>
          </main>
          <div id=":r1:" class="gvyl4n">Generated dynamic stuff</div>
        </body>
      </html>`,
      'text/html'
    );
  });

  describe('Critical Container Protection', () => {
    it('identifies html and body as critical and refuses candidate generation', () => {
      const htmlEl = doc.documentElement;
      const bodyEl = doc.body;

      expect(isCriticalElement(htmlEl)).toBe(true);
      expect(isCriticalElement(bodyEl)).toBe(true);

      const htmlCandidates = generateSelectorCandidates(htmlEl, doc);
      expect(htmlCandidates).toHaveLength(0);

      const bodyCandidates = generateSelectorCandidates(bodyEl, doc);
      expect(bodyCandidates).toHaveLength(0);
    });
  });

  describe('Dynamic Hash Filter', () => {
    it('detects generated IDs and classes', () => {
      expect(isDynamicId(':r1:')).toBe(true);
      expect(isDynamicId('ember12345')).toBe(true);
      expect(isDynamicId('main-header')).toBe(false);

      expect(isDynamicClass('gvyl4n')).toBe(true);
      expect(isDynamicClass('css-1dbjc4n')).toBe(true);
      expect(isDynamicClass('feed-post')).toBe(false);
    });
  });

  describe('Candidate Generation & Hierarchy', () => {
    it('generates high-confidence stable data-testid selector for profile button', () => {
      const btn = doc.querySelector('[data-testid="profile-btn"]')!;
      expect(btn).not.toBeNull();

      const candidates = generateSelectorCandidates(btn, doc);
      expect(candidates.length).toBeGreaterThan(0);

      const top = candidates[0];
      expect(top.confidence).toBe('high');
      expect(top.selector).toContain('data-testid="profile-btn"');
      expect(top.matchCount).toBe(1);
    });

    it('generates high-confidence ARIA selector for sidebar with accessible label', () => {
      const aside = doc.querySelector('aside')!;
      expect(aside).not.toBeNull();

      const candidates = generateSelectorCandidates(aside, doc);
      expect(candidates.length).toBeGreaterThan(0);

      const ariaCandidate = candidates.find((c) => c.selector.includes('Trending News'));
      expect(ariaCandidate).toBeDefined();
      expect(ariaCandidate!.confidence).toBe('high');
      expect(ariaCandidate!.matchCount).toBe(1);
    });

    it('correctly calculates match counts for repeated components', () => {
      const firstPost = doc.querySelector('.feed-post')!;
      const candidates = generateSelectorCandidates(firstPost, doc);

      const postCardCandidate = candidates.find((c) => c.selector === '[data-testid="post-card"]');
      expect(postCardCandidate).toBeDefined();
      expect(postCardCandidate!.matchCount).toBe(2); // Both posts match
    });
  });

  describe('analyzeElement High-level metadata', () => {
    it('infers component type and suggested name for navigation', () => {
      const nav = doc.querySelector('nav')!;
      const analysis = analyzeElement(nav, doc);

      expect(analysis.tag).toBe('nav');
      expect(analysis.componentType).toBe('Navigation');
      expect(analysis.suggestedName).toBe('Main Navigation');
      expect(analysis.candidates.length).toBeGreaterThan(0);
    });

    it('infers component type for article post', () => {
      const article = doc.querySelector('article')!;
      const analysis = analyzeElement(article, doc);

      expect(analysis.tag).toBe('article');
      expect(analysis.componentType).toBe('Card / Post');
      expect(analysis.suggestedName).toBe('Post 1');
    });
  });
});
