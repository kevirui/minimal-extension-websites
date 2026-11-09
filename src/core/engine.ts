import {
  CustomRule,
  RuleDefinition,
  SiteAdapter,
  SiteSettings,
} from './types';

export const STYLE_ELEMENT_PREFIX = 'clearframe-rule-';
export const CUSTOM_STYLE_PREFIX = 'clearframe-custom-';

export interface RuleEngineContext {
  document: Document;
}

export class RuleEngine {
  private activeCleanups = new Map<string, () => void>();
  private activeStyleElements = new Map<string, HTMLStyleElement>();
  private activeCustomStyles = new Map<string, HTMLStyleElement>();
  private observer: MutationObserver | null = null;
  private isObserving = false;
  private currentSettings: SiteSettings = {};
  private customRules: CustomRule[] = [];
  private currentUrl: URL | null = null;
  private adapter: SiteAdapter;
  private doc: Document;

  constructor(adapter: SiteAdapter, context: RuleEngineContext = { document: window.document }) {
    this.adapter = adapter;
    this.doc = context.document;
    try {
      this.currentUrl = typeof window !== 'undefined' && window.location?.href ? new URL(window.location.href) : null;
    } catch {
      this.currentUrl = null;
    }
  }

  /**
   * Sets the current active URL for route-level applicability checks.
   */
  public setCurrentUrl(url: URL | string): void {
    try {
      this.currentUrl = typeof url === 'string' ? new URL(url) : url;
    } catch {
      this.currentUrl = null;
    }
  }

  /**
   * Evaluates whether a given rule is applicable to the current route.
   */
  public isRuleApplicableOnRoute(rule: RuleDefinition): boolean {
    if (!this.currentUrl) {
      return true;
    }
    if (rule.isApplicable) {
      return rule.isApplicable(this.currentUrl);
    }
    return true;
  }

  /**
   * Applies both native adapter settings and custom rules.
   */
  public applySettings(settings: SiteSettings, url?: URL | string, customRules?: CustomRule[]): void {
    this.currentSettings = { ...settings };
    if (url) {
      this.setCurrentUrl(url);
    }
    if (customRules !== undefined) {
      this.applyCustomRules(customRules);
    }

    for (const rule of this.adapter.rules) {
      const isEnabled = settings[rule.id] ?? rule.defaultEnabled;
      const isApplicable = this.isRuleApplicableOnRoute(rule);
      const shouldApply = isEnabled && isApplicable;

      // 1. Ownership-aware CSS rule application
      const hasCss = (rule.selectors && rule.selectors.length > 0) || Boolean(rule.customCss);
      if (hasCss) {
        if (shouldApply) {
          this.applyCssRule(rule.id, rule.selectors || [], rule.customCss);
        } else {
          this.removeCssRule(rule.id);
        }
      }

      // 2. Programmatic JS apply & cleanup
      if (rule.apply) {
        const hasActiveCleanup = this.activeCleanups.has(rule.id);

        if (shouldApply && !hasActiveCleanup) {
          try {
            const cleanup = rule.apply(this.doc);
            if (typeof cleanup === 'function') {
              this.activeCleanups.set(rule.id, cleanup);
            }
          } catch (err) {
            console.error(`[ClearFrame] Error applying rule ${rule.id}:`, err);
          }
        } else if (!shouldApply && hasActiveCleanup) {
          const cleanup = this.activeCleanups.get(rule.id);
          this.activeCleanups.delete(rule.id);
          if (cleanup) {
            try {
              cleanup();
            } catch (err) {
              console.error(`[ClearFrame] Error cleaning up rule ${rule.id}:`, err);
            }
          }
        }
      }
    }

    // 3. Ensure observer is active if any active dynamic rule needs subtree observation
    this.ensureObserver();
  }

  /**
   * Applies custom user rules dynamically with isolated style tags.
   */
  public applyCustomRules(rules: CustomRule[]): void {
    this.customRules = [...rules];
    const incomingIds = new Set(rules.map((r) => r.id));

    // Remove any custom rules no longer present or disabled
    for (const [ruleId] of this.activeCustomStyles.entries()) {
      const currentRule = rules.find((r) => r.id === ruleId);
      if (!currentRule || !currentRule.enabled) {
        this.removeCustomCssRule(ruleId);
      }
    }

    // Apply enabled custom rules
    for (const rule of rules) {
      if (rule.enabled && rule.selector) {
        this.applyCustomCssRule(rule);
      } else {
        this.removeCustomCssRule(rule.id);
      }
    }
  }

  private applyCustomCssRule(rule: CustomRule): void {
    const styleId = `${CUSTOM_STYLE_PREFIX}${rule.id}`;
    let styleEl = this.activeCustomStyles.get(rule.id);

    if (!styleEl || !this.doc.contains(styleEl)) {
      const existing = this.doc.getElementById(styleId) as HTMLStyleElement | null;
      if (existing) {
        styleEl = existing;
      } else {
        styleEl = this.doc.createElement('style');
        styleEl.id = styleId;
        styleEl.setAttribute('data-clearframe-custom', rule.id);
        styleEl.setAttribute('data-clearframe-hostname', rule.hostname);
        (this.doc.head || this.doc.documentElement).appendChild(styleEl);
      }
      this.activeCustomStyles.set(rule.id, styleEl);
    }

    const cssContent = `/* [ClearFrame Custom Rule] ${rule.name} (${rule.id}) */\n${rule.selector} {\n  display: none !important;\n}`;
    if (styleEl.textContent !== cssContent) {
      styleEl.textContent = cssContent;
    }
  }

  private removeCustomCssRule(ruleId: string): void {
    const styleId = `${CUSTOM_STYLE_PREFIX}${ruleId}`;
    const styleEl = this.activeCustomStyles.get(ruleId) || (this.doc.getElementById(styleId) as HTMLStyleElement | null);

    if (styleEl) {
      if (styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
      this.activeCustomStyles.delete(ruleId);
    }
  }

  /**
   * Injects or updates a dedicated style element owned strictly by the specified rule.
   * Prevents overwriting or removing styles owned by other rules or the site itself.
   */
  private applyCssRule(ruleId: string, selectors: string[], customCss?: string): void {
    const styleId = `${STYLE_ELEMENT_PREFIX}${ruleId}`;
    let styleEl = this.activeStyleElements.get(ruleId);

    if (!styleEl || !this.doc.contains(styleEl)) {
      const existing = this.doc.getElementById(styleId) as HTMLStyleElement | null;
      if (existing) {
        styleEl = existing;
      } else {
        styleEl = this.doc.createElement('style');
        styleEl.id = styleId;
        styleEl.setAttribute('data-clearframe-site', this.adapter.id);
        styleEl.setAttribute('data-clearframe-rule', ruleId);
        (this.doc.head || this.doc.documentElement).appendChild(styleEl);
      }
      this.activeStyleElements.set(ruleId, styleEl);
    }

    const cssParts: string[] = [`/* [ClearFrame] Site: ${this.adapter.id} | Rule: ${ruleId} */`];
    if (selectors.length > 0) {
      cssParts.push(`${selectors.join(',\n')} {\n  display: none !important;\n}`);
    }
    if (customCss) {
      cssParts.push(customCss);
    }

    const cssContent = cssParts.join('\n\n');
    if (styleEl.textContent !== cssContent) {
      styleEl.textContent = cssContent;
    }
  }

  /**
   * Safely removes a rule's dedicated style element without affecting other rules.
   */
  private removeCssRule(ruleId: string): void {
    const styleId = `${STYLE_ELEMENT_PREFIX}${ruleId}`;
    const styleEl = this.activeStyleElements.get(ruleId) || (this.doc.getElementById(styleId) as HTMLStyleElement | null);

    if (styleEl) {
      if (styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
      this.activeStyleElements.delete(ruleId);
    }
  }

  /**
   * Sets up a debounced mutation observer on the document body if dynamic JS rules are defined.
   */
  private ensureObserver(): void {
    const hasDynamicRules = this.adapter.rules.some((r) => typeof r.apply === 'function');
    if (!hasDynamicRules || this.isObserving) {
      return;
    }

    let timeoutId: number | null = null;
    this.observer = new MutationObserver(() => {
      if (timeoutId !== null) return;
      timeoutId = window.setTimeout(() => {
        timeoutId = null;
        this.reapplyDynamicRules();
      }, 100);
    });

    const target = this.doc.body || this.doc.documentElement;
    if (target) {
      this.observer.observe(target, {
        childList: true,
        subtree: true,
      });
      this.isObserving = true;
    }
  }

  private reapplyDynamicRules(): void {
    for (const rule of this.adapter.rules) {
      if (!rule.apply) continue;
      const isEnabled = this.currentSettings[rule.id] ?? rule.defaultEnabled;
      const isApplicable = this.isRuleApplicableOnRoute(rule);
      if (isEnabled && isApplicable) {
        try {
          const cleanup = rule.apply(this.doc);
          if (typeof cleanup === 'function') {
            this.activeCleanups.set(rule.id, cleanup);
          }
        } catch (err) {
          console.error(`[ClearFrame] Error during dynamic reapply of rule ${rule.id}:`, err);
        }
      }
    }
  }

  /**
   * Returns list of currently active applied rule IDs on the current route.
   */
  public getAppliedRuleIds(): string[] {
    const applied: string[] = [];
    for (const rule of this.adapter.rules) {
      const isEnabled = this.currentSettings[rule.id] ?? rule.defaultEnabled;
      const isApplicable = this.isRuleApplicableOnRoute(rule);
      if (isEnabled && isApplicable) {
        applied.push(rule.id);
      }
    }
    return applied;
  }

  /**
   * Returns list of currently active custom rules.
   */
  public getAppliedCustomRules(): CustomRule[] {
    return this.customRules.filter((r) => r.enabled);
  }

  /**
   * Completely tears down all injected styles, observers, and custom rule cleanups.
   */
  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      this.isObserving = false;
    }

    // Clean up all active JS rules
    for (const [id, cleanup] of this.activeCleanups.entries()) {
      try {
        cleanup();
      } catch (err) {
        console.error(`[ClearFrame] Error cleaning up rule ${id}:`, err);
      }
    }
    this.activeCleanups.clear();

    // Remove all rule-specific style tags
    for (const rule of this.adapter.rules) {
      this.removeCssRule(rule.id);
    }
    this.activeStyleElements.clear();

    // Remove all custom rule styles
    for (const rule of this.customRules) {
      this.removeCustomCssRule(rule.id);
    }
    this.activeCustomStyles.clear();
  }
}
