import { describe, it, expect, beforeEach } from 'vitest';
import { AdapterRegistry } from './registry';
import { youtubeAdapter } from '../adapters/youtube';
import { redditAdapter } from '../adapters/reddit';
import { SiteAdapter } from './types';

describe('AdapterRegistry & Strict Hostname Matching', () => {
  let registry: AdapterRegistry;

  beforeEach(() => {
    registry = new AdapterRegistry();
  });

  it('registers and retrieves adapters by id', () => {
    registry.register(youtubeAdapter);
    registry.register(redditAdapter);

    expect(registry.get('youtube')).toBe(youtubeAdapter);
    expect(registry.get('reddit')).toBe(redditAdapter);
    expect(registry.getAll()).toHaveLength(2);
  });

  it('validates adapter metadata on registration', () => {
    expect(() => {
      registry.register({ id: '', name: 'Test', matches: ['test.com'], rules: [] } as unknown as SiteAdapter);
    }).toThrow('missing id');

    expect(() => {
      registry.register({ id: 'test' as any, name: '', matches: ['test.com'], rules: [] } as unknown as SiteAdapter);
    }).toThrow('missing name');

    expect(() => {
      registry.register({ id: 'test' as any, name: 'Test', matches: [], rules: [] } as unknown as SiteAdapter);
    }).toThrow('matches must be a non-empty array');
  });

  it('strictly matches legitimate hostnames and subdomains', () => {
    registry.register(youtubeAdapter);
    registry.register(redditAdapter);

    // YouTube matches
    expect(registry.matchByHostname('youtube.com')?.id).toBe('youtube');
    expect(registry.matchByHostname('www.youtube.com')?.id).toBe('youtube');
    expect(registry.matchByHostname('m.youtube.com')?.id).toBe('youtube');

    // Reddit matches
    expect(registry.matchByHostname('reddit.com')?.id).toBe('reddit');
    expect(registry.matchByHostname('old.reddit.com')?.id).toBe('reddit');
    expect(registry.matchByHostname('sh.reddit.com')?.id).toBe('reddit');
    expect(registry.matchByHostname('www.reddit.com')?.id).toBe('reddit');
  });

  it('prevents unsafe substring matching on deceptive domain names', () => {
    registry.register(youtubeAdapter);
    registry.register(redditAdapter);

    // Phishing / deceptive domain names ending with or containing the target string
    expect(registry.matchByHostname('youtube.com.evil.org')).toBeUndefined();
    expect(registry.matchByHostname('notyoutube.com')).toBeUndefined();
    expect(registry.matchByHostname('fakeyoutube.com')).toBeUndefined();
    expect(registry.matchByHostname('reddit.com.attacker.com')).toBeUndefined();
    expect(registry.matchByHostname('notreddit.com')).toBeUndefined();
    expect(registry.matchByHostname('reddit.phishing.io')).toBeUndefined();
    expect(registry.matchByHostname('wikipedia.org')).toBeUndefined();
  });

  it('matches full URLs accurately with strict domain validation', () => {
    registry.register(youtubeAdapter);
    registry.register(redditAdapter);

    expect(registry.matchByUrl('https://www.youtube.com/watch?v=123')?.id).toBe('youtube');
    expect(registry.matchByUrl('https://m.youtube.com/shorts/xyz')?.id).toBe('youtube');
    expect(registry.matchByUrl('https://reddit.com/r/technology')?.id).toBe('reddit');
    expect(registry.matchByUrl('https://youtube.com.attacker.com/watch?v=123')).toBeUndefined();
    expect(registry.matchByUrl('invalid-url-string')).toBeUndefined();
  });

  it('maintains isolation between distinct site adapters', () => {
    const customSite: SiteAdapter = {
      id: 'youtube', // ID collision test
      name: 'Custom',
      matches: ['custom.org'],
      rules: [],
    };

    registry.register(youtubeAdapter);
    registry.register(redditAdapter);

    expect(registry.get('youtube')?.name).toBe('YouTube');
    expect(registry.get('reddit')?.name).toBe('Reddit');

    // Overwriting adapter replaces only that entry
    registry.register(customSite);
    expect(registry.get('youtube')?.name).toBe('Custom');
    expect(registry.get('reddit')?.name).toBe('Reddit');
  });
});
