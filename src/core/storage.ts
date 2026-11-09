import {
  AppSettings,
  CustomRule,
  PersistedAppSettings,
  SiteAdapter,
  SiteSettings,
} from './types';

export const STORAGE_KEY = 'clearframe_settings';
export const CURRENT_SETTINGS_VERSION = 1;

/**
 * Validates, migrates, and normalizes settings against registered adapter specifications.
 * Safely handles missing, outdated, or corrupted stored configurations.
 * 
 * Supports:
 * - V1 Versioned Schema: { version: 1, sites: { youtube: { ... } }, customRules: [ ... ] }
 * - Legacy unversioned raw map: { youtube: { ... } }
 */
export function normalizeSettings(
  raw: unknown,
  adapters: SiteAdapter[]
): AppSettings {
  const result: AppSettings = {};

  let sitesData: Record<string, unknown> = {};

  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const rawObj = raw as Record<string, unknown>;
    // Check if it's the versioned schema
    if (typeof rawObj.version === 'number' && rawObj.sites && typeof rawObj.sites === 'object' && !Array.isArray(rawObj.sites)) {
      sitesData = rawObj.sites as Record<string, unknown>;
    } else {
      // Legacy unversioned direct map
      sitesData = rawObj;
    }
  }

  for (const adapter of adapters) {
    const siteRaw = (sitesData[adapter.id] && typeof sitesData[adapter.id] === 'object' && !Array.isArray(sitesData[adapter.id]))
      ? (sitesData[adapter.id] as Record<string, unknown>)
      : {};

    const siteSettings: SiteSettings = {};

    for (const rule of adapter.rules) {
      if (typeof siteRaw[rule.id] === 'boolean') {
        siteSettings[rule.id] = siteRaw[rule.id] as boolean;
      } else {
        siteSettings[rule.id] = rule.defaultEnabled;
      }
    }

    result[adapter.id] = siteSettings;
  }

  return result;
}

/**
 * Normalizes custom rules array from raw storage.
 */
export function normalizeCustomRules(raw: unknown): CustomRule[] {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return [];
  }
  const rawObj = raw as Record<string, unknown>;
  const rulesList = Array.isArray(rawObj.customRules) ? rawObj.customRules : [];
  
  return rulesList
    .filter((r): r is Record<string, unknown> => typeof r === 'object' && r !== null)
    .filter((r) => typeof r.id === 'string' && typeof r.selector === 'string' && typeof r.hostname === 'string')
    .map((r) => ({
      id: String(r.id),
      name: typeof r.name === 'string' ? r.name : 'Custom Rule',
      hostname: String(r.hostname).toLowerCase(),
      selector: String(r.selector),
      enabled: typeof r.enabled === 'boolean' ? r.enabled : true,
      createdAt: typeof r.createdAt === 'number' ? r.createdAt : Date.now(),
      strategy: 'hide' as const,
      targetMode: r.targetMode === 'single' ? ('single' as const) : ('all' as const),
      version: typeof r.version === 'number' ? r.version : 1,
    }));
}

/**
 * Packs in-memory AppSettings and custom rules into the persisted, versioned schema format.
 */
export function toPersistedFormat(
  settings: AppSettings,
  customRules: CustomRule[] = []
): PersistedAppSettings {
  return {
    version: CURRENT_SETTINGS_VERSION,
    sites: settings,
    customRules,
  };
}

/**
 * Returns default settings for all adapters.
 */
export function getDefaultSettings(adapters: SiteAdapter[]): AppSettings {
  return normalizeSettings({}, adapters);
}

/**
 * Storage API wrapper that works with chrome.storage.local (and fallbacks to in-memory/localStorage for tests).
 */
export interface StorageBackend {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  onChange(callback: (newValue: unknown) => void): () => void;
}

class BrowserStorageBackend implements StorageBackend {
  async get(key: string): Promise<unknown> {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const res = await chrome.storage.local.get(key);
      return res[key];
    }
    if (typeof localStorage !== 'undefined') {
      const item = localStorage.getItem(key);
      try {
        return item ? JSON.parse(item) : undefined;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  async set(key: string, value: unknown): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ [key]: value });
      return;
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  onChange(callback: (newValue: unknown) => void): () => void {
    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      const listener = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
        if (areaName === 'local' && changes[STORAGE_KEY]) {
          callback(changes[STORAGE_KEY].newValue);
        }
      };
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    }
    if (typeof window !== 'undefined') {
      const listener = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY) {
          try {
            callback(event.newValue ? JSON.parse(event.newValue) : undefined);
          } catch {
            callback(undefined);
          }
        }
      };
      window.addEventListener('storage', listener);
      return () => window.removeEventListener('storage', listener);
    }
    return () => {};
  }
}

export const defaultStorageBackend: StorageBackend = new BrowserStorageBackend();

/**
 * Mutex queue to serialize asynchronous read-modify-write operations,
 * completely preventing concurrent writes from silently losing updates.
 */
class WriteMutex {
  private queue: Promise<unknown> = Promise.resolve();

  public async run<T>(task: () => Promise<T>): Promise<T> {
    const resultPromise = this.queue.then(() => task(), () => task());
    this.queue = resultPromise.catch(() => {});
    return resultPromise;
  }
}

const storageMutex = new WriteMutex();

/**
 * Reads preferences for all sites, normalized with defaults.
 */
export async function loadAppSettings(
  adapters: SiteAdapter[],
  backend: StorageBackend = defaultStorageBackend
): Promise<AppSettings> {
  try {
    const raw = await backend.get(STORAGE_KEY);
    return normalizeSettings(raw, adapters);
  } catch (err) {
    console.warn('[ClearFrame] Failed to read storage, fallback to defaults:', err);
    return getDefaultSettings(adapters);
  }
}

/**
 * Loads all custom rules from storage.
 */
export async function loadCustomRules(
  backend: StorageBackend = defaultStorageBackend
): Promise<CustomRule[]> {
  try {
    const raw = await backend.get(STORAGE_KEY);
    return normalizeCustomRules(raw);
  } catch (err) {
    console.warn('[ClearFrame] Failed to read custom rules:', err);
    return [];
  }
}

/**
 * Loads custom rules matching a specific hostname (handles subdomains cleanly).
 */
export async function loadCustomRulesForHostname(
  hostname: string,
  backend: StorageBackend = defaultStorageBackend
): Promise<CustomRule[]> {
  const all = await loadCustomRules(backend);
  const normalizedHost = hostname.toLowerCase();
  return all.filter((r) => {
    const ruleHost = r.hostname.toLowerCase();
    return normalizedHost === ruleHost || normalizedHost.endsWith(`.${ruleHost}`) || ruleHost.endsWith(`.${normalizedHost}`);
  });
}

/**
 * Saves entire settings object and custom rules in versioned schema.
 */
export async function saveAppSettings(
  settings: AppSettings,
  backend: StorageBackend = defaultStorageBackend,
  customRules?: CustomRule[]
): Promise<void> {
  const rules = customRules !== undefined ? customRules : await loadCustomRules(backend);
  const persisted = toPersistedFormat(settings, rules);
  await backend.set(STORAGE_KEY, persisted);
}

/**
 * Saves or updates a custom rule using the WriteMutex.
 */
export async function saveCustomRule(
  rule: CustomRule,
  backend: StorageBackend = defaultStorageBackend,
  adapters: SiteAdapter[] = []
): Promise<CustomRule[]> {
  return storageMutex.run(async () => {
    const raw = await backend.get(STORAGE_KEY);
    const currentSettings = normalizeSettings(raw, adapters);
    const currentRules = normalizeCustomRules(raw);

    const existingIndex = currentRules.findIndex((r) => r.id === rule.id);
    let updatedRules: CustomRule[];
    if (existingIndex >= 0) {
      updatedRules = [...currentRules];
      updatedRules[existingIndex] = { ...rule };
    } else {
      updatedRules = [...currentRules, { ...rule }];
    }

    const persisted = toPersistedFormat(currentSettings, updatedRules);
    await backend.set(STORAGE_KEY, persisted);
    return updatedRules;
  });
}

/**
 * Deletes a custom rule by ID.
 */
export async function deleteCustomRule(
  ruleId: string,
  backend: StorageBackend = defaultStorageBackend,
  adapters: SiteAdapter[] = []
): Promise<CustomRule[]> {
  return storageMutex.run(async () => {
    const raw = await backend.get(STORAGE_KEY);
    const currentSettings = normalizeSettings(raw, adapters);
    const currentRules = normalizeCustomRules(raw);

    const updatedRules = currentRules.filter((r) => r.id !== ruleId);
    const persisted = toPersistedFormat(currentSettings, updatedRules);
    await backend.set(STORAGE_KEY, persisted);
    return updatedRules;
  });
}

/**
 * Toggles a custom rule's enabled state.
 */
export async function toggleCustomRule(
  ruleId: string,
  enabled: boolean,
  backend: StorageBackend = defaultStorageBackend,
  adapters: SiteAdapter[] = []
): Promise<CustomRule[]> {
  return storageMutex.run(async () => {
    const raw = await backend.get(STORAGE_KEY);
    const currentSettings = normalizeSettings(raw, adapters);
    const currentRules = normalizeCustomRules(raw);

    const updatedRules = currentRules.map((r) => (r.id === ruleId ? { ...r, enabled } : r));
    const persisted = toPersistedFormat(currentSettings, updatedRules);
    await backend.set(STORAGE_KEY, persisted);
    return updatedRules;
  });
}

/**
 * Updates a single rule preference and persists it safely using the WriteMutex.
 * Ensures concurrent calls across multiple rules or sites do not race or overwrite each other.
 */
export async function setRuleEnabled(
  adapters: SiteAdapter[],
  siteId: string,
  ruleId: string,
  enabled: boolean,
  backend: StorageBackend = defaultStorageBackend
): Promise<AppSettings> {
  return storageMutex.run(async () => {
    const raw = await backend.get(STORAGE_KEY);
    const current = normalizeSettings(raw, adapters);
    const currentRules = normalizeCustomRules(raw);

    const updated: AppSettings = {
      ...current,
      [siteId]: {
        ...(current[siteId] || {}),
        [ruleId]: enabled,
      },
    };

    const persisted = toPersistedFormat(updated, currentRules);
    await backend.set(STORAGE_KEY, persisted);
    return updated;
  });
}
