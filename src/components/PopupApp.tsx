import React, { useEffect, useState, useRef, useCallback } from 'react';
import { defaultRegistry } from '../core/registry';
import { loadAppSettings, setRuleEnabled } from '../core/storage';
import { AppSettings, ExtensionMessage, ExtensionResponse, RuleDefinition, SiteAdapter } from '../core/types';
import { Switch } from '../components/Switch';
import '../adapters'; // Ensure all adapters are registered
import './popup.css';

export const PopupApp: React.FC = () => {
  const [activeTabUrl, setActiveTabUrl] = useState<string>('');
  const [activeTabId, setActiveTabId] = useState<number | undefined>(undefined);
  const [matchedAdapter, setMatchedAdapter] = useState<SiteAdapter | undefined>(undefined);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingRuleId, setPendingRuleId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [contentScriptConnected, setContentScriptConnected] = useState<boolean>(false);
  const [reconnecting, setReconnecting] = useState<boolean>(false);

  // Initialize and query active tab & preferences
  const loadTabAndSettings = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      let url = '';
      let tabId: number | undefined;

      if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
          url = tab.url || '';
          tabId = tab.id;
        }
      } else if (typeof window !== 'undefined') {
        url = window.location.href;
      }

      setActiveTabUrl(url);
      setActiveTabId(tabId);

      const adapter = defaultRegistry.matchByUrl(url);
      setMatchedAdapter(adapter);

      const loaded = await loadAppSettings(defaultRegistry.getAll());
      setSettings(loaded);

      // Ping content script to verify connectivity
      if (adapter && tabId && typeof chrome !== 'undefined' && chrome.tabs?.sendMessage) {
        const pingMsg: ExtensionMessage = { type: 'CLEARFRAME_PING' };
        try {
          const sendPromise = chrome.tabs.sendMessage(tabId, pingMsg);
          if (sendPromise && typeof sendPromise.then === 'function') {
            sendPromise
              .then((res: ExtensionResponse) => {
                if (res && res.type === 'CLEARFRAME_PONG') {
                  setContentScriptConnected(true);
                } else {
                  setContentScriptConnected(false);
                }
              })
              .catch(() => {
                setContentScriptConnected(false);
              });
          }
        } catch {
          setContentScriptConnected(false);
        }
      }
    } catch (err) {
      console.error('[ClearFrame] Popup init error:', err);
      setErrorMessage('Failed to read settings from browser storage.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTabAndSettings();
  }, [loadTabAndSettings]);

  // Retry content script handshake
  const handleRetryConnection = async () => {
    if (!activeTabId || !matchedAdapter) return;
    setReconnecting(true);
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs?.sendMessage) {
        const pingMsg: ExtensionMessage = { type: 'CLEARFRAME_PING' };
        const res = (await chrome.tabs.sendMessage(activeTabId, pingMsg)) as ExtensionResponse;
        if (res && res.type === 'CLEARFRAME_PONG') {
          setContentScriptConnected(true);
          setErrorMessage(null);
        }
      }
    } catch {
      setContentScriptConnected(false);
    } finally {
      setReconnecting(false);
    }
  };

  const handleToggle = async (ruleId: string, currentVal: boolean) => {
    if (!matchedAdapter || !settings || pendingRuleId !== null) return;

    setPendingRuleId(ruleId);
    setErrorMessage(null);

    const prevSettings = settings;
    const newVal = !currentVal;
    const siteId = matchedAdapter.id;

    // 1. Optimistic UI update
    const nextSettings: AppSettings = {
      ...prevSettings,
      [siteId]: {
        ...(prevSettings[siteId] || {}),
        [ruleId]: newVal,
      },
    };
    setSettings(nextSettings);

    try {
      // 2. Persist to storage with WriteMutex
      const persistedSettings = await setRuleEnabled(
        defaultRegistry.getAll(),
        siteId,
        ruleId,
        newVal
      );

      setSettings(persistedSettings);

      // 3. Dispatch structured message to content script
      if (activeTabId && typeof chrome !== 'undefined' && chrome.tabs?.sendMessage) {
        const message: ExtensionMessage = {
          type: 'CLEARFRAME_SETTINGS_UPDATED',
          siteId,
          settings: persistedSettings[siteId],
          source: 'popup',
        };

        try {
          const res = (await chrome.tabs.sendMessage(activeTabId, message)) as ExtensionResponse;
          if (res && res.type === 'CLEARFRAME_ERROR') {
            setErrorMessage(`Content script error: ${res.error}`);
          } else {
            setContentScriptConnected(true);
          }
        } catch {
          // Tab may be still loading or navigated away
          setContentScriptConnected(false);
        }
      }
    } catch (err) {
      console.error('[ClearFrame] Failed to update rule:', err);
      // Revert optimistic update upon storage failure
      setSettings(prevSettings);
      setErrorMessage('Could not save preference to local storage.');
    } finally {
      setPendingRuleId(null);
    }
  };

  const parsedUrl = (() => {
    try {
      return activeTabUrl ? new URL(activeTabUrl) : null;
    } catch {
      return null;
    }
  })();

  const currentHostname = parsedUrl?.hostname || '';

  // Determine page applicability for a given rule
  const checkApplicability = (rule: RuleDefinition): { isApplicable: boolean; badge?: string; tooltip?: string } => {
    if (!parsedUrl) {
      return { isApplicable: true };
    }

    if (rule.isApplicable) {
      const applicable = rule.isApplicable(parsedUrl);
      if (!applicable) {
        const scopeLabel = rule.scope === 'watch' ? 'Watch page only' : rule.scope === 'home' ? 'Homepage only' : 'Other page';
        return {
          isApplicable: false,
          badge: scopeLabel,
          tooltip: `This rule is saved but only applies on the ${scopeLabel.toLowerCase()}.`,
        };
      }
    }

    if (rule.scope && rule.scope !== 'all') {
      const scopeLabel = rule.scope === 'watch' ? 'Watch page' : rule.scope === 'home' ? 'Homepage' : rule.scope;
      return {
        isApplicable: true,
        badge: scopeLabel,
        tooltip: `Active on ${scopeLabel.toLowerCase()}.`,
      };
    }

    return { isApplicable: true };
  };

  return (
    <div className="cf-popup-container" data-testid="clearframe-popup">
      {/* Brand Header */}
      <header className="cf-header">
        <div className="cf-brand">
          <div className="cf-logo-mark" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </div>
          <div>
            <h1 className="cf-title">ClearFrame</h1>
            <span className="cf-subtitle">Distraction-Free Web</span>
          </div>
        </div>
        <span className="cf-version-badge">v0.1</span>
      </header>

      {/* Target Site Bar */}
      <div className="cf-site-bar">
        <div className="cf-site-meta">
          <span className="cf-site-label">Target Site</span>
          <span className="cf-site-name" title={currentHostname || 'None'}>
            {matchedAdapter ? matchedAdapter.name : currentHostname || 'No active web page'}
          </span>
        </div>
        {matchedAdapter ? (
          <span className="cf-badge cf-badge-active" title="ClearFrame is supported on this website">
            <span className="cf-badge-dot" />
            Supported
          </span>
        ) : (
          <span className="cf-badge cf-badge-inactive" title="This domain is not currently supported by ClearFrame">
            Unsupported
          </span>
        )}
      </div>

      {/* Connectivity Warning when Content Script is not responding */}
      {matchedAdapter && !loading && !contentScriptConnected && (
        <div className="cf-notice-banner" data-testid="connectivity-notice">
          <div className="cf-notice-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="cf-notice-body">
            <p className="cf-notice-text">Page script initializing or page reloaded.</p>
            <button
              type="button"
              className="cf-notice-action"
              onClick={handleRetryConnection}
              disabled={reconnecting}
            >
              {reconnecting ? 'Checking...' : 'Refresh link'}
            </button>
          </div>
        </div>
      )}

      {/* In-Popup Error Notice */}
      {errorMessage && (
        <div className="cf-error-alert" role="alert" data-testid="error-alert">
          <div className="cf-error-icon" aria-hidden="true">!</div>
          <p className="cf-error-text">{errorMessage}</p>
        </div>
      )}

      {/* Main Content Area */}
      <main className="cf-content">
        {loading ? (
          <div className="cf-status-box" data-testid="loading-state">
            <div className="cf-spinner" />
            <p>Loading rules...</p>
          </div>
        ) : !matchedAdapter ? (
          <div className="cf-empty-state" data-testid="empty-state">
            <div className="cf-empty-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>
            <h3>Site Not Supported Yet</h3>
            <p>
              ClearFrame currently supports <strong>YouTube</strong> and <strong>Reddit</strong>.
              Navigate to a supported website to configure interface rules.
            </p>
          </div>
        ) : (
          <div className="cf-rules-list" data-testid="rules-list">
            <div className="cf-rules-header">
              <span>{matchedAdapter.name} Interface Rules</span>
              <span className="cf-rules-count">{matchedAdapter.rules.length} available</span>
            </div>

            {matchedAdapter.rules.map((rule) => {
              const siteSettings = settings?.[matchedAdapter.id] || {};
              const isChecked = siteSettings[rule.id] ?? rule.defaultEnabled;
              const { badge, tooltip } = checkApplicability(rule);

              return (
                <Switch
                  key={rule.id}
                  id={`rule-switch-${rule.id}`}
                  checked={isChecked}
                  label={rule.label}
                  description={rule.description}
                  badge={badge}
                  badgeTooltip={tooltip}
                  disabled={pendingRuleId !== null}
                  onChange={() => handleToggle(rule.id, isChecked)}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="cf-footer">
        <span>Runs 100% locally &bull; Zero tracking</span>
      </footer>
    </div>
  );
};
