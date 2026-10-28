import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  normalizeSettings,
  getDefaultSettings,
  loadAppSettings,
  saveAppSettings,
  setRuleEnabled,
  toPersistedFormat,
  CURRENT_SETTINGS_VERSION,
} from './storage';
import { MemoryStorageBackend } from './memoryStorage';
import { youtubeAdapter } from '../adapters/youtube';
import { redditAdapter } from '../adapters/reddit';
import { instagramAdapter } from '../adapters/instagram';
import { SiteAdapter } from './types';

describe('Storage, Migration, and Settings Validation', () => {
  const adapters = [youtubeAdapter, redditAdapter, instagramAdapter];
  let memoryBackend: MemoryStorageBackend;

  beforeEach(() => {
    memoryBackend = new MemoryStorageBackend();
  });

  it('generates correct defaults matching adapter declarations', () => {
    const defaults = getDefaultSettings(adapters);

    expect(defaults.youtube).toBeDefined();
    expect(defaults.youtube['yt-hide-shorts']).toBe(true);
    expect(defaults.youtube['yt-hide-sidebar']).toBe(false);
    expect(defaults.youtube['yt-hide-categories']).toBe(false);
    expect(defaults.youtube['yt-hide-header-buttons']).toBe(false);
    expect(defaults.youtube['yt-clean-watch-actions']).toBe(false);
    expect(defaults.youtube['yt-hide-video-description']).toBe(false);
    expect(defaults.youtube['yt-center-watch-player']).toBe(false);
    expect(defaults.youtube['yt-hide-related-videos']).toBe(false);
    expect(defaults.youtube['yt-hide-comments']).toBe(false);

    expect(defaults.reddit).toBeDefined();
    expect(defaults.reddit['reddit-hide-promoted']).toBe(true);
    expect(defaults.reddit['reddit-hide-sidebar-recommendations']).toBe(false);

    expect(defaults.instagram).toBeDefined();
    expect(defaults.instagram['ig-hide-floating-messages']).toBe(false);
    expect(defaults.instagram['ig-hide-right-sidebar']).toBe(false);
    expect(defaults.instagram['ig-hide-nav-buttons']).toBe(false);
  });

  it('safely handles missing, empty, or null stored values', () => {
    const fromNull = normalizeSettings(null, adapters);
    expect(fromNull.youtube['yt-hide-shorts']).toBe(true);

    const fromUndefined = normalizeSettings(undefined, adapters);
    expect(fromUndefined.reddit['reddit-hide-promoted']).toBe(true);

    const fromEmptyObj = normalizeSettings({}, adapters);
    expect(fromEmptyObj.youtube['yt-hide-related-videos']).toBe(false);
  });

  it('supports versioned V1 schema transparently', () => {
    const versioned = {
      version: 1,
      sites: {
        youtube: {
          'yt-hide-shorts': false,
        },
      },
    };

    const normalized = normalizeSettings(versioned, adapters);
    expect(normalized.youtube['yt-hide-shorts']).toBe(false);
    expect(normalized.youtube['yt-hide-comments']).toBe(false); // default
    expect(normalized.reddit['reddit-hide-promoted']).toBe(true); // default
  });

  it('normalizes legacy unversioned stored configurations without data loss', () => {
    const legacy = {
      youtube: {
        'yt-hide-shorts': false,
        'yt-hide-related-videos': true,
      },
    };

    const normalized = normalizeSettings(legacy, adapters);
    expect(normalized.youtube['yt-hide-shorts']).toBe(false);
    expect(normalized.youtube['yt-hide-related-videos']).toBe(true);
  });

  it('packs settings into versioned persisted format', () => {
    const inMemory = getDefaultSettings(adapters);
    const persisted = toPersistedFormat(inMemory);

    expect(persisted.version).toBe(CURRENT_SETTINGS_VERSION);
    expect(persisted.sites).toEqual(inMemory);
  });

  it('safely normalizes malformed or corrupted values (non-boolean rules, arrays, strings)', () => {
    const malformed = {
      version: 'invalid',
      sites: {
        youtube: {
          'yt-hide-shorts': 'invalid_string',
          'yt-hide-related-videos': 12345,
          'yt-hide-comments': null,
        },
        reddit: 'not-an-object',
      },
    };

    const normalized = normalizeSettings(malformed, adapters);

    // Fallbacks to default rule state safely
    expect(normalized.youtube['yt-hide-shorts']).toBe(true);
    expect(normalized.youtube['yt-hide-related-videos']).toBe(false);
    expect(normalized.youtube['yt-hide-comments']).toBe(false);
    expect(normalized.reddit['reddit-hide-promoted']).toBe(true);
  });

  it('preserves existing user choices when a new default rule is added to an adapter', () => {
    // 1. Initial stored state with only rule A configured
    const stored = {
      version: 1,
      sites: {
        youtube: {
          'yt-hide-shorts': false, // user explicitly disabled
        },
      },
    };

    // 2. Adapter dynamically introduces a new rule with default true
    const extendedAdapter: SiteAdapter = {
      ...youtubeAdapter,
      rules: [
        ...youtubeAdapter.rules,
        {
          id: 'yt-new-feature',
          label: 'New Feature',
          description: 'A new feature added in a subsequent update',
          defaultEnabled: true,
        },
      ],
    };

    const normalized = normalizeSettings(stored, [extendedAdapter, redditAdapter]);
    // Explicit user choice is preserved
    expect(normalized.youtube['yt-hide-shorts']).toBe(false);
    // New rule receives its default enabled value
    expect(normalized.youtube['yt-new-feature']).toBe(true);
  });

  it('handles concurrent updates cleanly without losing writes', async () => {
    // Launch multiple concurrent writes across different rules and sites simultaneously
    await Promise.all([
      setRuleEnabled(adapters, 'youtube', 'yt-hide-shorts', false, memoryBackend),
      setRuleEnabled(adapters, 'youtube', 'yt-hide-comments', true, memoryBackend),
      setRuleEnabled(adapters, 'reddit', 'reddit-hide-sidebar-recommendations', true, memoryBackend),
    ]);

    const finalSettings = await loadAppSettings(adapters, memoryBackend);

    // All writes must be preserved without one overwriting the other
    expect(finalSettings.youtube['yt-hide-shorts']).toBe(false);
    expect(finalSettings.youtube['yt-hide-comments']).toBe(true);
    expect(finalSettings.reddit['reddit-hide-sidebar-recommendations']).toBe(true);
    expect(finalSettings.reddit['reddit-hide-promoted']).toBe(true); // default intact
  });

  it('falls back to default settings when storage read fails', async () => {
    memoryBackend.shouldFailGet = true;
    const settings = await loadAppSettings(adapters, memoryBackend);

    expect(settings.youtube['yt-hide-shorts']).toBe(true);
    expect(settings.reddit['reddit-hide-promoted']).toBe(true);
  });

  it('throws predictably when storage write fails', async () => {
    memoryBackend.shouldFailSet = true;
    await expect(
      setRuleEnabled(adapters, 'youtube', 'yt-hide-shorts', false, memoryBackend)
    ).rejects.toThrow('Simulated storage write failure');
  });

  it('fires onChange listeners when storage updates', async () => {
    const listener = vi.fn();
    const unsub = memoryBackend.onChange(listener);

    await setRuleEnabled(adapters, 'youtube', 'yt-hide-shorts', false, memoryBackend);
    expect(listener).toHaveBeenCalledTimes(1);

    unsub();
    await setRuleEnabled(adapters, 'youtube', 'yt-hide-comments', true, memoryBackend);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
