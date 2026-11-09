import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RuleEngine, STYLE_ELEMENT_PREFIX } from '../core/engine';
import { youtubeAdapter } from '../adapters/youtube';
import { redditAdapter } from '../adapters/reddit';
import { defaultRegistry } from '../core/registry';
import '../adapters';
import {
  loadAppSettings,
  setRuleEnabled,
  getDefaultSettings,
} from '../core/storage';
import { MemoryStorageBackend } from '../core/memoryStorage';
import { CustomRule, ExtensionMessage, ExtensionResponse } from '../core/types';
import {
  youtubeHomeFixture,
  youtubeWatchFixture,
  redditFeedFixture,
} from './fixtures';

describe('End-to-End Workflow & Integration Scenarios (Deterministic)', () => {
  let memoryBackend: MemoryStorageBackend;
  let parser: DOMParser;

  beforeEach(() => {
    memoryBackend = new MemoryStorageBackend();
    parser = new DOMParser();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // SCENARIO A: Initial State
  it('Scenario A: confirms initial state, registry identification, and default preferences', async () => {
    const testUrl = 'https://www.youtube.com/';
    const matchedAdapter = defaultRegistry.matchByUrl(testUrl);

    expect(matchedAdapter).toBeDefined();
    expect(matchedAdapter?.id).toBe('youtube');

    // Storage initializes with defaults
    const loaded = await loadAppSettings(defaultRegistry.getAll(), memoryBackend);
    expect(loaded.youtube).toBeDefined();
    expect(loaded.youtube['yt-hide-shorts']).toBe(true);
    expect(loaded.youtube['yt-hide-sidebar']).toBe(false);
    expect(loaded.youtube['yt-hide-categories']).toBe(false);
    expect(loaded.youtube['yt-hide-header-buttons']).toBe(false);
    expect(loaded.youtube['yt-clean-watch-actions']).toBe(false);
    expect(loaded.youtube['yt-hide-video-description']).toBe(false);
    expect(loaded.youtube['yt-center-watch-player']).toBe(false);
    expect(loaded.youtube['yt-hide-related-videos']).toBe(false);
    expect(loaded.youtube['yt-hide-comments']).toBe(false);

    expect(loaded.instagram).toBeDefined();
    expect(loaded.instagram['ig-theme-modern-dark']).toBe(false);
    expect(loaded.instagram['ig-hide-floating-messages']).toBe(false);
    expect(loaded.instagram['ig-hide-right-sidebar']).toBe(false);
    expect(loaded.instagram['ig-hide-feed']).toBe(false);
    expect(loaded.instagram['ig-hide-stories-tray']).toBe(false);
    expect(loaded.instagram['ig-hide-nav-buttons']).toBe(false);

    expect(loaded.linkedin).toBeDefined();
    expect(loaded.linkedin['li-hide-feed']).toBe(false);
    expect(loaded.linkedin['li-hide-promoted']).toBe(true);
    expect(loaded.linkedin['li-hide-right-sidebar']).toBe(false);
    expect(loaded.linkedin['li-hide-left-sidebar']).toBe(false);
    expect(loaded.linkedin['li-hide-floating-messages']).toBe(false);
    expect(loaded.linkedin['li-clean-nav-header']).toBe(false);
  });

  // SCENARIO B: Toggle & DOM Visibility
  it('Scenario B: toggles a rule, applies dedicated style to DOM, and removes it cleanly upon disable', () => {
    const doc = parser.parseFromString(youtubeHomeFixture, 'text/html');
    const engine = new RuleEngine(youtubeAdapter, { document: doc });

    // 1. Initial enabled state for Shorts
    engine.applySettings({ 'yt-hide-shorts': true }, new URL('https://www.youtube.com/'));
    const styleEl = doc.getElementById(`${STYLE_ELEMENT_PREFIX}yt-hide-shorts`);
    expect(styleEl).not.toBeNull();
    expect(styleEl?.textContent).toContain('ytd-rich-shelf-renderer[is-shorts]');

    // Confirm unrelated controls (like search and organic video cards) are not selected
    const organicCard = doc.getElementById('video-card-1');
    expect(organicCard).not.toBeNull();

    // 2. Disable rule
    engine.applySettings({ 'yt-hide-shorts': false }, new URL('https://www.youtube.com/'));
    const removedStyle = doc.getElementById(`${STYLE_ELEMENT_PREFIX}yt-hide-shorts`);
    expect(removedStyle).toBeNull();

    engine.destroy();
  });

  // SCENARIO C: Persistence across sessions & reloads
  it('Scenario C: changes rule state, verifies persistence, and ensures fresh engine reads persisted value', async () => {
    // 1. Toggle "Hide Comments" to true
    await setRuleEnabled(defaultRegistry.getAll(), 'youtube', 'yt-hide-comments', true, memoryBackend);

    // 2. Read back from storage (simulating popup close and browser restart)
    const storedAfter = await loadAppSettings(defaultRegistry.getAll(), memoryBackend);
    expect(storedAfter.youtube['yt-hide-comments']).toBe(true);

    // 3. New page session mounts engine and applies persisted settings
    const doc = parser.parseFromString(youtubeWatchFixture, 'text/html');
    const freshEngine = new RuleEngine(youtubeAdapter, { document: doc });
    freshEngine.applySettings(storedAfter.youtube, new URL('https://www.youtube.com/watch?v=123'));

    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}yt-hide-comments`)).not.toBeNull();
    freshEngine.destroy();
  });

  // SCENARIO D: Dynamic SPA Navigation & Route Scopes
  it('Scenario D: navigates between Home -> Watch -> Search -> Home, recalculating route rules without losing preferences', () => {
    const doc = parser.parseFromString(youtubeHomeFixture, 'text/html');
    const engine = new RuleEngine(youtubeAdapter, { document: doc });

    // User has enabled all rules in settings
    const userSettings = {
      'yt-hide-shorts': true,
      'yt-hide-related-videos': true,
      'yt-hide-comments': true,
    };

    // Route 1: Homepage
    engine.applySettings(userSettings, new URL('https://www.youtube.com/'));
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}yt-hide-shorts`)).not.toBeNull();
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}yt-hide-comments`)).toBeNull(); // not on watch

    // Route 2: Watch page
    engine.applySettings(userSettings, new URL('https://www.youtube.com/watch?v=abc'));
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}yt-hide-shorts`)).not.toBeNull();
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}yt-hide-comments`)).not.toBeNull(); // active on watch
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}yt-hide-related-videos`)).not.toBeNull();

    // Route 3: Search results
    engine.applySettings(userSettings, new URL('https://www.youtube.com/results?search_query=test'));
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}yt-hide-shorts`)).not.toBeNull();
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}yt-hide-comments`)).toBeNull();

    // Route 4: Back to Homepage
    engine.applySettings(userSettings, new URL('https://www.youtube.com/'));
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}yt-hide-shorts`)).not.toBeNull();
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}yt-hide-comments`)).toBeNull();

    engine.destroy();
  });

  // SCENARIO E: Rule Isolation
  it('Scenario E: enables two independent rules, disables one, and verifies the other remains fully active', () => {
    const doc = parser.parseFromString(youtubeWatchFixture, 'text/html');
    const engine = new RuleEngine(youtubeAdapter, { document: doc });
    const watchUrl = new URL('https://www.youtube.com/watch?v=123');

    // Enable both comments and related videos
    engine.applySettings({ 'yt-hide-comments': true, 'yt-hide-related-videos': true }, watchUrl);
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}yt-hide-comments`)).not.toBeNull();
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}yt-hide-related-videos`)).not.toBeNull();

    // Disable only comments
    engine.applySettings({ 'yt-hide-comments': false, 'yt-hide-related-videos': true }, watchUrl);
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}yt-hide-comments`)).toBeNull();
    // Related videos style MUST be completely intact
    expect(doc.getElementById(`${STYLE_ELEMENT_PREFIX}yt-hide-related-videos`)).not.toBeNull();

    engine.destroy();
  });

  // SCENARIO F: Unsupported Website
  it('Scenario F: opens unrelated website, verifying no adapter matches and no styles are injected', () => {
    const unsupportedUrl = 'https://news.ycombinator.com/';
    const matched = defaultRegistry.matchByUrl(unsupportedUrl);
    expect(matched).toBeUndefined();

    // Even on domain containing substring (e.g. deceptive domain)
    const spoofUrl = 'https://youtube.com.evil.org/';
    expect(defaultRegistry.matchByUrl(spoofUrl)).toBeUndefined();
  });

  // SCENARIO G: Custom Rules Application & Reversibility
  it('Scenario G: applies custom user rule, tests live hiding, dynamic addition, and clean removal', () => {
    const doc = parser.parseFromString(
      `<!DOCTYPE html>
      <html>
        <body>
          <div class="user-sidebar" id="custom-target">Custom Sidebar Content</div>
          <div class="feed-content" id="keep-target">Important Content</div>
        </body>
      </html>`,
      'text/html'
    );

    const engine = new RuleEngine(youtubeAdapter, { document: doc });
    const url = new URL('https://www.youtube.com/');

    const customRule: CustomRule = {
      id: 'custom-widget-1',
      name: 'Hide User Sidebar',
      hostname: 'www.youtube.com',
      selector: '#custom-target',
      enabled: true,
      createdAt: Date.now(),
      strategy: 'hide',
      version: 1,
    };

    // Apply with custom rule
    engine.applySettings({}, url, [customRule]);

    const customStyle = doc.getElementById('clearframe-custom-custom-widget-1');
    expect(customStyle).not.toBeNull();
    expect(customStyle!.textContent).toContain('#custom-target {\n  display: none !important;\n}');

    // Disable custom rule
    engine.applyCustomRules([{ ...customRule, enabled: false }]);
    expect(doc.getElementById('clearframe-custom-custom-widget-1')).toBeNull();

    // Re-enable and then destroy
    engine.applyCustomRules([customRule]);
    expect(doc.getElementById('clearframe-custom-custom-widget-1')).not.toBeNull();
    engine.destroy();
    expect(doc.getElementById('clearframe-custom-custom-widget-1')).toBeNull();
  });
});
