/**
 * Core type definitions for ClearFrame.
 */

export type SiteId = 'youtube' | 'reddit' | 'instagram';

/**
 * Contextual page types for route-level applicability.
 * 'all' means applicable throughout the entire domain.
 */
export type PageScope = 'all' | 'home' | 'watch' | 'feed' | 'post';

export interface RuleDefinition {
  /** Unique, stable rule identifier within the adapter (e.g. 'yt-hide-shorts') */
  id: string;
  /** Human-readable label displayed in the UI switch */
  label: string;
  /** Description explaining what the rule removes */
  description: string;
  /** Default enabled state if no stored preference exists */
  defaultEnabled: boolean;
  /**
   * Optional page scope declaring where this rule is effective.
   * If omitted, defaults to 'all'.
   */
  scope?: PageScope;
  /**
   * Optional function to test whether the rule is currently applicable for a given URL / route pathname.
   * If not provided, the scope property is evaluated against standard paths.
   */
  isApplicable?: (url: URL) => boolean;
  /**
   * CSS selectors targeted by this rule.
   * If provided, ClearFrame will generate declarative, ownership-tagged CSS to hide them cleanly.
   */
  selectors?: string[];
  /**
   * Optional custom raw CSS rules (e.g. alignment overrides, custom layout styles).
   */
  customCss?: string;
  /**
   * Optional custom DOM handler for complex components requiring dynamic manipulation.
   * Must return an idempotent cleanup callback that safely undoes all modifications.
   */
  apply?: (targetDoc: Document) => (() => void) | void;
}

export interface SiteAdapter {
  /** Stable unique identifier matching SiteId */
  id: SiteId;
  /** Display name shown in popup header */
  name: string;
  /** Hostname match patterns (e.g. ['youtube.com', '*.youtube.com']) */
  matches: string[];
  /** Rules supported by this site */
  rules: RuleDefinition[];
  /** Optional site-specific lifecycle hook called on initial content script mount */
  onInit?: (context: { document: Document }) => void;
  /** Optional site-specific cleanup hook called when unloading */
  onDestroy?: () => void;
}

/**
 * Site rule settings map: ruleId -> boolean
 */
export type SiteSettings = Record<string, boolean>;

/**
 * Persisted schema format (versioned).
 */
export interface PersistedAppSettings {
  version: number;
  sites: Record<string, SiteSettings>;
}

/**
 * Normalized in-memory settings representation: siteId -> ruleId -> boolean
 */
export type AppSettings = Record<string, SiteSettings>;

/**
 * Structured runtime messaging protocol
 */
export type ExtensionMessage =
  | {
      type: 'CLEARFRAME_SETTINGS_UPDATED';
      siteId: SiteId;
      settings: SiteSettings;
      source?: 'popup' | 'storage' | 'test';
    }
  | {
      type: 'CLEARFRAME_PING';
    }
  | {
      type: 'CLEARFRAME_GET_STATE';
      siteId: SiteId;
    };

export type ExtensionResponse =
  | {
      type: 'CLEARFRAME_PONG';
      siteId?: SiteId;
      active: boolean;
      appliedRules?: string[];
      currentUrl?: string;
    }
  | {
      type: 'CLEARFRAME_STATE_REPORT';
      siteId: SiteId;
      active: boolean;
      appliedRules: string[];
    }
  | {
      type: 'CLEARFRAME_ERROR';
      error: string;
    }
  | {
      type: 'CLEARFRAME_ACK';
      success: boolean;
      appliedCount?: number;
    };
