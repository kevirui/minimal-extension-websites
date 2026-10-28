import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RuleEngine, STYLE_ELEMENT_PREFIX } from './engine';
import { SiteAdapter } from './types';

describe('RuleEngine Lifecycle, Ownership Isolation & SPA Navigation', () => {
  let doc: Document;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('Test Page');
  });

  afterEach(() => {
    const styles = doc.querySelectorAll('style[id^="clearframe-rule-"]');
    styles.forEach((s) => s.remove());
  });

  const testAdapter: SiteAdapter = {
    id: 'youtube',
    name: 'YouTube',
    matches: ['youtube.com'],
    rules: [
      {
        id: 'rule-shorts',
        label: 'Shorts',
        description: 'Test rule (global)',
        defaultEnabled: true,
        scope: 'all',
        selectors: ['ytd-rich-shelf-renderer[is-shorts]', '.shorts-entry'],
      },
      {
        id: 'rule-home-feed',
        label: 'Feed',
        description: 'Feed rule (home page only)',
        defaultEnabled: true,
        scope: 'home',
        isApplicable: (url: URL) => url.pathname === '/',
        selectors: ['#feed-container'],
      },
      {
        id: 'rule-comments',
        label: 'Comments',
        description: 'Comments rule (watch page only)',
        defaultEnabled: true,
        scope: 'watch',
        isApplicable: (url: URL) => url.pathname === '/watch',
        selectors: ['#comments-container'],
      },
      {
        id: 'rule-custom-js',
        label: 'Custom Rule',
        description: 'Uses JS apply callback',
        defaultEnabled: false,
        scope: 'all',
        apply: (d) => {
          const marker = d.createElement('div');
          marker.id = 'custom-applied-marker';
          d.body.appendChild(marker);
          return () => {
            marker.remove();
          };
        },
      },
    ],
  };

  it('applies only route-applicable rules on the homepage', () => {
    const engine = new RuleEngine(testAdapter, { document: doc });
    const homeUrl = new URL('https://www.youtube.com/');

    engine.applySettings({ 'rule-shorts': true, 'rule-home-feed': true, 'rule-comments': true }, homeUrl);

    // Global Shorts rule should be active
    const shortsStyle = doc.getElementById(`${STYLE_ELEMENT_PREFIX}rule-shorts`);
    expect(shortsStyle).not.toBeNull();

    // Home feed rule should be active
    const feedStyle = doc.getElementById(`${STYLE_ELEMENT_PREFIX}rule-home-feed`);
    expect(feedStyle).not.toBeNull();

    // Comments rule is NOT applicable on homepage; must not be injected
    const commentsStyle = doc.getElementById(`${STYLE_ELEMENT_PREFIX}rule-comments`);
    expect(commentsStyle).toBeNull();

    expect(engine.getAppliedRuleIds()).toEqual(['rule-shorts', 'rule-home-feed']);

    engine.destroy();
  });

  it('cleans up obsolete route rules when navigating from home to watch page without losing saved preferences', () => {
    const engine = new RuleEngine(testAdapter, { document: doc });
    const userSettings = { 'rule-shorts': true, 'rule-home-feed': true, 'rule-comments': true };

    // 1. User starts on Homepage
    engine.applySettings(userSettings, new URL('https://www.youtube.com/'));
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}rule-home-feed`)).not.toBeNull();
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}rule-comments`)).toBeNull();

    // 2. User navigates via SPA client router to Watch page
    engine.applySettings(userSettings, new URL('https://www.youtube.com/watch?v=12345'));

    // Home feed rule must be cleaned up immediately
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}rule-home-feed`)).toBeNull();
    // Comments rule must now be applied
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}rule-comments`)).not.toBeNull();
    // Global Shorts rule remains active
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}rule-shorts`)).not.toBeNull();

    expect(engine.getAppliedRuleIds()).toEqual(['rule-shorts', 'rule-comments']);

    // 3. User navigates back to Home page
    engine.applySettings(userSettings, new URL('https://www.youtube.com/'));
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}rule-home-feed`)).not.toBeNull();
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}rule-comments`)).toBeNull();

    engine.destroy();
  });

  it('maintains strict rule isolation when disabling a single rule', () => {
    const engine = new RuleEngine(testAdapter, { document: doc });
    const homeUrl = new URL('https://www.youtube.com/');

    engine.applySettings({ 'rule-shorts': true, 'rule-home-feed': true }, homeUrl);
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}rule-shorts`)).not.toBeNull();
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}rule-home-feed`)).not.toBeNull();

    // Disable shorts only
    engine.applySettings({ 'rule-shorts': false, 'rule-home-feed': true }, homeUrl);
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}rule-shorts`)).toBeNull();
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}rule-home-feed`)).not.toBeNull();

    engine.destroy();
  });

  it('guarantees idempotent application across repeated router updates', () => {
    const engine = new RuleEngine(testAdapter, { document: doc });
    const homeUrl = new URL('https://www.youtube.com/');

    engine.applySettings({ 'rule-shorts': true }, homeUrl);
    engine.applySettings({ 'rule-shorts': true }, homeUrl);
    engine.applySettings({ 'rule-shorts': true }, homeUrl);

    const matchedStyles = doc.querySelectorAll(`[id="${STYLE_ELEMENT_PREFIX}rule-shorts"]`);
    expect(matchedStyles.length).toBe(1);

    engine.destroy();
  });

  it('executes custom JS apply and cleans up when rule is toggled off', () => {
    const engine = new RuleEngine(testAdapter, { document: doc });
    expect(doc.getElementById('custom-applied-marker')).toBeNull();

    // Enable custom JS rule
    engine.applySettings({ 'rule-custom-js': true });
    expect(doc.getElementById('custom-applied-marker')).not.toBeNull();

    // Disable custom JS rule -> cleanup should run
    engine.applySettings({ 'rule-custom-js': false });
    expect(doc.getElementById('custom-applied-marker')).toBeNull();

    engine.destroy();
  });

  it('completely cleans up DOM on engine.destroy()', () => {
    const engine = new RuleEngine(testAdapter, { document: doc });
    engine.applySettings({ 'rule-shorts': true, 'rule-home-feed': true, 'rule-custom-js': true });

    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}rule-shorts`)).not.toBeNull();
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}rule-home-feed`)).not.toBeNull();
    expect(doc.getElementById('custom-applied-marker')).not.toBeNull();

    engine.destroy();

    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}rule-shorts`)).toBeNull();
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}rule-home-feed`)).toBeNull();
    expect(doc.getElementById('custom-applied-marker')).toBeNull();
  });
});
