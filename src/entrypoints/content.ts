import { defineContentScript } from 'wxt/sandbox';
import { defaultRegistry } from '@/core/registry';
import { loadAppSettings, defaultStorageBackend } from '@/core/storage';
import { RuleEngine } from '@/core/engine';
import { AppSettings, ExtensionMessage, ExtensionResponse } from '@/core/types';
import '@/adapters'; // Register adapters

export default defineContentScript({
  matches: [
    '*://*.youtube.com/*',
    '*://*.reddit.com/*',
    '*://*.instagram.com/*',
  ],
  runAt: 'document_start',
  main() {
    const currentHost = window.location.hostname;
    const adapter = defaultRegistry.matchByHostname(currentHost);

    if (!adapter) {
      return;
    }

    // Initialize the RuleEngine for this site with current location
    const engine = new RuleEngine(adapter, { document: window.document });
    engine.setCurrentUrl(window.location.href);

    // Site-level custom init if declared
    if (adapter.onInit) {
      try {
        adapter.onInit({ document: window.document });
      } catch (err) {
        console.error(`[ClearFrame] Adapter init failed for ${adapter.id}:`, err);
      }
    }

    const refreshSettingsAndApply = async () => {
      try {
        engine.setCurrentUrl(window.location.href);
        const settings: AppSettings = await loadAppSettings(defaultRegistry.getAll());
        const siteSettings = settings[adapter.id] || {};
        engine.applySettings(siteSettings, window.location.href);
      } catch (err) {
        console.error(`[ClearFrame] Failed to load/apply settings on ${adapter.id}:`, err);
      }
    };

    // Initial load
    refreshSettingsAndApply();

    // Listen to storage changes (persisted across tabs / popups)
    const cleanupStorage = defaultStorageBackend.onChange(() => {
      refreshSettingsAndApply();
    });

    // Listen to runtime messages for immediate zero-reload updates from popup
    let messageListener: ((message: unknown, sender: chrome.runtime.MessageSender, sendResponse: (res: ExtensionResponse) => void) => boolean) | null = null;

    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      messageListener = (
        message: unknown,
        _sender: chrome.runtime.MessageSender,
        sendResponse: (res: ExtensionResponse) => void
      ) => {
        if (!message || typeof message !== 'object') {
          return false;
        }

        const msg = message as ExtensionMessage;

        if (msg.type === 'CLEARFRAME_SETTINGS_UPDATED') {
          if (msg.siteId === adapter.id && msg.settings) {
            try {
              engine.applySettings(msg.settings, window.location.href);
              sendResponse({
                type: 'CLEARFRAME_ACK',
                success: true,
                appliedCount: engine.getAppliedRuleIds().length,
              });
            } catch (err) {
              sendResponse({
                type: 'CLEARFRAME_ERROR',
                error: err instanceof Error ? err.message : String(err),
              });
            }
          } else {
            sendResponse({
              type: 'CLEARFRAME_ACK',
              success: false,
            });
          }
          return false;
        }

        if (msg.type === 'CLEARFRAME_PING') {
          sendResponse({
            type: 'CLEARFRAME_PONG',
            siteId: adapter.id,
            active: true,
            appliedRules: engine.getAppliedRuleIds(),
            currentUrl: window.location.href,
          });
          return false;
        }

        if (msg.type === 'CLEARFRAME_GET_STATE') {
          if (msg.siteId === adapter.id) {
            sendResponse({
              type: 'CLEARFRAME_STATE_REPORT',
              siteId: adapter.id,
              active: true,
              appliedRules: engine.getAppliedRuleIds(),
            });
          } else {
            sendResponse({
              type: 'CLEARFRAME_ERROR',
              error: `Adapter ID mismatch (expected ${adapter.id}, got ${msg.siteId})`,
            });
          }
          return false;
        }

        return false;
      };

      chrome.runtime.onMessage.addListener(messageListener);
    }

    // Handle SPA navigation events
    // YouTube fires 'yt-navigate-finish', Reddit fires 'popstate' and custom pushState events
    let lastHandledPath = window.location.pathname + window.location.search;

    const handleNavigation = () => {
      const currentPath = window.location.pathname + window.location.search;
      if (currentPath === lastHandledPath) {
        // Path hasn't changed; avoid duplicate work
        return;
      }
      lastHandledPath = currentPath;
      refreshSettingsAndApply();
    };

    window.addEventListener('yt-navigate-finish', handleNavigation);
    window.addEventListener('popstate', handleNavigation);

    // Patch pushState & replaceState to detect SPA router changes
    const originalPushState = history.pushState;
    history.pushState = function (...args) {
      const ret = originalPushState.apply(this, args);
      handleNavigation();
      return ret;
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function (...args) {
      const ret = originalReplaceState.apply(this, args);
      handleNavigation();
      return ret;
    };

    // Clean up on page unload
    window.addEventListener('unload', () => {
      if (messageListener && typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
        chrome.runtime.onMessage.removeListener(messageListener);
      }
      cleanupStorage();
      engine.destroy();
      if (adapter.onDestroy) {
        adapter.onDestroy();
      }
    });
  },
});
