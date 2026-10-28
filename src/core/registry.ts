import { SiteAdapter, SiteId } from './types';

export class AdapterRegistry {
  private adapters = new Map<SiteId, SiteAdapter>();

  public register(adapter: SiteAdapter): void {
    if (!adapter.id || typeof adapter.id !== 'string') {
      throw new Error(`[ClearFrame] Invalid adapter: missing id`);
    }
    if (!adapter.name || typeof adapter.name !== 'string') {
      throw new Error(`[ClearFrame] Invalid adapter ${adapter.id}: missing name`);
    }
    if (!Array.isArray(adapter.matches) || adapter.matches.length === 0) {
      throw new Error(`[ClearFrame] Invalid adapter ${adapter.id}: matches must be a non-empty array`);
    }
    if (this.adapters.has(adapter.id)) {
      console.warn(`[ClearFrame] Overwriting adapter for site: ${adapter.id}`);
    }
    this.adapters.set(adapter.id, adapter);
  }

  public get(id: SiteId): SiteAdapter | undefined {
    return this.adapters.get(id);
  }

  public getAll(): SiteAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Matches a given hostname against registered site adapters using strict hostname domain matching.
   * Prevents unsafe substring matching (e.g. 'youtube.com.evil.org' will never match 'youtube.com').
   * 
   * Matching rules:
   * 1. Exact match: cleanHost === cleanPattern (e.g. 'youtube.com' === 'youtube.com')
   * 2. Wildcard domain match: pattern is '*.youtube.com' or 'youtube.com'
   *    Matches cleanHost === domain OR cleanHost.endsWith('.' + domain)
   */
  public matchByHostname(hostname: string): SiteAdapter | undefined {
    if (!hostname || typeof hostname !== 'string') {
      return undefined;
    }

    const cleanHost = hostname.toLowerCase().trim();

    for (const adapter of this.adapters.values()) {
      for (const pattern of adapter.matches) {
        const cleanPattern = pattern.toLowerCase().trim();

        // Exact match
        if (cleanHost === cleanPattern) {
          return adapter;
        }

        // Wildcard subdomain matching (e.g. '*.youtube.com' or '.youtube.com')
        let domainRoot = cleanPattern;
        if (domainRoot.startsWith('*.')) {
          domainRoot = domainRoot.slice(2);
        } else if (domainRoot.startsWith('.')) {
          domainRoot = domainRoot.slice(1);
        }

        // Subdomain check: must either equal domainRoot exactly OR have a dot immediately before it
        // e.g. 'm.youtube.com' ends with '.youtube.com', but 'notyoutube.com' does NOT.
        if (cleanHost === domainRoot || cleanHost.endsWith('.' + domainRoot)) {
          return adapter;
        }
      }
    }

    return undefined;
  }

  /**
   * Matches a full URL string against registered adapters.
   */
  public matchByUrl(urlString: string): SiteAdapter | undefined {
    try {
      const url = new URL(urlString);
      return this.matchByHostname(url.hostname);
    } catch {
      return undefined;
    }
  }
}

export const defaultRegistry = new AdapterRegistry();
