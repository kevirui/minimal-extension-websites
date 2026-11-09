import React, { useEffect, useState, useCallback } from "react";
import { defaultRegistry } from "../core/registry";
import { loadAppSettings, setRuleEnabled } from "../core/storage";
import {
  AppSettings,
  ExtensionMessage,
  ExtensionResponse,
  RuleDefinition,
  SiteAdapter,
} from "../core/types";
import "../adapters"; // Ensure all adapters are registered
import "./popup.css";

// SVG Icons matching the clean screenshot design
const HomeIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const LeftPaneIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
  </svg>
);

const RightPaneIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="15" y1="3" x2="15" y2="21" />
  </svg>
);

const FeedIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="5" y="2" width="14" height="20" rx="3" />
    <line x1="9" y1="6" x2="15" y2="6" />
    <line x1="9" y1="10" x2="15" y2="10" />
    <line x1="9" y1="14" x2="13" y2="14" />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ChevronDownIcon = ({ open }: { open?: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.2s ease",
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ShareIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const BellIcon = () => (
  <span
    role="img"
    aria-label="bell"
    style={{ fontSize: "12px", marginRight: "4px" }}
  >
    🔔
  </span>
);

export const PopupApp: React.FC = () => {
  const [activeTabUrl, setActiveTabUrl] = useState<string>("");
  const [activeTabId, setActiveTabId] = useState<number | undefined>(undefined);
  const [matchedAdapter, setMatchedAdapter] = useState<SiteAdapter | undefined>(
    undefined,
  );
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingRuleId, setPendingRuleId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [contentScriptConnected, setContentScriptConnected] =
    useState<boolean>(false);
  const [reconnecting, setReconnecting] = useState<boolean>(false);

  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Collapsible accordion state for sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    navigation: false,
    leftPane: false,
    rightPane: false,
    feed: false,
  });

  const toggleSection = (sectionKey: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Initialize and query active tab & preferences
  const loadTabAndSettings = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      let url = "";
      let tabId: number | undefined;

      if (typeof chrome !== "undefined" && chrome.tabs?.query) {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tab) {
          url = tab.url || "";
          tabId = tab.id;
        }
      } else if (typeof window !== "undefined") {
        url = window.location.href;
      }

      setActiveTabUrl(url);
      setActiveTabId(tabId);

      const adapter = defaultRegistry.matchByUrl(url);
      setMatchedAdapter(adapter);

      const loaded = await loadAppSettings(defaultRegistry.getAll());
      setSettings(loaded);

      // Ping content script to verify connectivity
      if (
        adapter &&
        tabId &&
        typeof chrome !== "undefined" &&
        chrome.tabs?.sendMessage
      ) {
        const pingMsg: ExtensionMessage = { type: "CLEARFRAME_PING" };
        try {
          const sendPromise = chrome.tabs.sendMessage(tabId, pingMsg);
          if (sendPromise && typeof sendPromise.then === "function") {
            sendPromise
              .then((res: ExtensionResponse) => {
                if (res && res.type === "CLEARFRAME_PONG") {
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
      console.error("[ClearFrame] Popup init error:", err);
      setErrorMessage("Failed to read settings from browser storage.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTabAndSettings();
  }, [loadTabAndSettings]);

  const handleRetryConnection = async () => {
    if (!activeTabId || !matchedAdapter) return;
    setReconnecting(true);
    try {
      if (typeof chrome !== "undefined" && chrome.tabs?.sendMessage) {
        const pingMsg: ExtensionMessage = { type: "CLEARFRAME_PING" };
        const res = (await chrome.tabs.sendMessage(
          activeTabId,
          pingMsg,
        )) as ExtensionResponse;
        if (res && res.type === "CLEARFRAME_PONG") {
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

    // Optimistic UI update
    const nextSettings: AppSettings = {
      ...prevSettings,
      [siteId]: {
        ...(prevSettings[siteId] || {}),
        [ruleId]: newVal,
      },
    };
    setSettings(nextSettings);

    try {
      const persistedSettings = await setRuleEnabled(
        defaultRegistry.getAll(),
        siteId,
        ruleId,
        newVal,
      );

      setSettings(persistedSettings);

      if (
        activeTabId &&
        typeof chrome !== "undefined" &&
        chrome.tabs?.sendMessage
      ) {
        const message: ExtensionMessage = {
          type: "CLEARFRAME_SETTINGS_UPDATED",
          siteId,
          settings: persistedSettings[siteId],
          source: "popup",
        };

        try {
          const res = (await chrome.tabs.sendMessage(
            activeTabId,
            message,
          )) as ExtensionResponse;
          if (res && res.type === "CLEARFRAME_ERROR") {
            setErrorMessage(`Content script error: ${res.error}`);
          } else {
            setContentScriptConnected(true);
          }
        } catch {
          setContentScriptConnected(false);
        }
      }
    } catch (err) {
      console.error("[ClearFrame] Failed to update rule:", err);
      setSettings(prevSettings);
      setErrorMessage("Could not save preference to local storage.");
    } finally {
      setPendingRuleId(null);
    }
  };

  const shareUrl = "https://chromewebstore.google.com";
  const shareText = "Distraction-Free Web with ClearFrame & Minimal Theme!";

  const handleShareTo = (platform: "twitter" | "linkedin" | "facebook" | "whatsapp" | "copy") => {
    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          "_blank",
          "noopener,noreferrer"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
          "_blank",
          "noopener,noreferrer"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank",
          "noopener,noreferrer"
        );
        break;
      case "whatsapp":
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
          "_blank",
          "noopener,noreferrer"
        );
        break;
      case "copy":
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(`${shareText} ${shareUrl}`).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
          });
        }
        break;
    }
  };

  const toggleShareMenu = () => {
    setShowShareMenu((prev) => !prev);
  };

  const parsedUrl = (() => {
    try {
      return activeTabUrl ? new URL(activeTabUrl) : null;
    } catch {
      return null;
    }
  })();

  const currentHostname = parsedUrl?.hostname || "";

  // Determine page applicability for a given rule
  const checkApplicability = (
    rule: RuleDefinition,
  ): { isApplicable: boolean; badge?: string; tooltip?: string } => {
    if (!parsedUrl) {
      return { isApplicable: true };
    }

    if (rule.isApplicable) {
      const applicable = rule.isApplicable(parsedUrl);
      if (!applicable) {
        const scopeLabel =
          rule.scope === "watch"
            ? "Watch page only"
            : rule.scope === "home"
              ? "Homepage only"
              : "Other page";
        return {
          isApplicable: false,
          badge: scopeLabel,
          tooltip: `This rule is saved but only applies on the ${scopeLabel.toLowerCase()}.`,
        };
      }
    }

    if (rule.scope && rule.scope !== "all") {
      const scopeLabel =
        rule.scope === "watch"
          ? "Watch page"
          : rule.scope === "home"
            ? "Homepage"
            : rule.scope;
      return {
        isApplicable: true,
        badge: scopeLabel,
        tooltip: `Active on ${scopeLabel.toLowerCase()}.`,
      };
    }

    return { isApplicable: true };
  };

  // Get rule icon helper
  const getRuleIcon = (ruleId: string) => {
    if (ruleId.includes("nav")) return <HomeIcon />;
    if (ruleId.includes("left")) return <LeftPaneIcon />;
    if (ruleId.includes("right")) return <RightPaneIcon />;
    if (ruleId.includes("feed")) return <FeedIcon />;
    if (ruleId.includes("message") || ruleId.includes("chat"))
      return <ChatBubbleIcon />;
    return <ShieldCheckIcon />;
  };

  return (
    <div className="min-window" data-testid="clearframe-popup">
      {/* Extension Header: Logo, Name, and Share Action */}
      <header className="min-navbar">
        <div className="min-brand">
          <div className="min-logo-box" aria-hidden="true">
            <span className="min-in-logo">in</span>
          </div>
          <span className="min-app-title">
            {matchedAdapter?.name ? matchedAdapter.name : "Minimal LinkedIn"}
          </span>
          {matchedAdapter && <span className="sr-only">Supported</span>}
        </div>
        <div className="min-share-container">
          <button
            type="button"
            className="min-share-btn"
            onClick={toggleShareMenu}
            aria-label="Share"
            aria-expanded={showShareMenu}
          >
            <ShareIcon />
            <span>Share</span>
          </button>

          {showShareMenu && (
            <div className="min-share-menu" role="menu">
              <div className="min-share-menu-header">Share extension</div>
              <button
                type="button"
                className="min-share-item"
                onClick={() => handleShareTo("twitter")}
                role="menuitem"
              >
                <span>𝕏 Twitter / X</span>
              </button>
              <button
                type="button"
                className="min-share-item"
                onClick={() => handleShareTo("linkedin")}
                role="menuitem"
              >
                <span>in LinkedIn</span>
              </button>
              <button
                type="button"
                className="min-share-item"
                onClick={() => handleShareTo("facebook")}
                role="menuitem"
              >
                <span>f Facebook</span>
              </button>
              <button
                type="button"
                className="min-share-item"
                onClick={() => handleShareTo("whatsapp")}
                role="menuitem"
              >
                <span>💬 WhatsApp</span>
              </button>
              <button
                type="button"
                className={`min-share-item ${copySuccess ? "min-share-item-copied" : ""}`}
                onClick={() => handleShareTo("copy")}
                role="menuitem"
              >
                <span>{copySuccess ? "✓ Link Copied!" : "📋 Copy Link"}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Connectivity & Error banners */}
      {matchedAdapter && !loading && !contentScriptConnected && (
        <div className="cf-notice-banner" data-testid="connectivity-notice">
          <div className="cf-notice-body">
            <p className="cf-notice-text">
              Page script initializing or page reloaded.
            </p>
            <button
              type="button"
              className="cf-notice-action"
              onClick={handleRetryConnection}
              disabled={reconnecting}
            >
              {reconnecting ? "Checking..." : "Refresh link"}
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="cf-error-alert" role="alert" data-testid="error-alert">
          <p className="cf-error-text">{errorMessage}</p>
        </div>
      )}

      {/* Main Content Area */}
      <main className="min-body">
        {loading ? (
          <div className="cf-status-box" data-testid="loading-state">
            <div className="cf-spinner" />
            <p>Loading rules...</p>
          </div>
        ) : !matchedAdapter ? (
          <div className="cf-empty-state" data-testid="empty-state">
            <div className="min-empty-text">
              <span className="cf-site-name">
                {currentHostname || "No active web page"}
              </span>
              <span className="cf-badge cf-badge-inactive">Unsupported</span>
            </div>
            <h3>Site Not Supported Yet</h3>
            <p>
              ClearFrame currently supports <strong>LinkedIn</strong>,{" "}
              <strong>YouTube</strong>, and <strong>Reddit</strong>.
            </p>
          </div>
        ) : (
          <div className="min-rules-wrapper" data-testid="rules-list">
            {/* OVERALL SECTION */}
            <div className="min-section-header">OVERALL</div>

            <div className="min-rules-group">
              {matchedAdapter.rules.map((rule) => {
                const siteSettings = settings?.[matchedAdapter.id] || {};
                const isChecked = siteSettings[rule.id] ?? rule.defaultEnabled;
                const { badge, tooltip } = checkApplicability(rule);

                return (
                  <div key={rule.id} className="min-rule-row">
                    <div className="min-rule-left">
                      <span className="min-rule-icon" aria-hidden="true">
                        {getRuleIcon(rule.id)}
                      </span>
                      <span className="min-rule-label">{rule.label}</span>
                      {badge && (
                        <span
                          className="min-scope-badge"
                          title={tooltip || badge}
                        >
                          {badge}
                        </span>
                      )}
                    </div>

                    <button
                      id={`rule-switch-${rule.id}`}
                      type="button"
                      role="switch"
                      aria-checked={isChecked}
                      aria-label={rule.label}
                      disabled={pendingRuleId !== null}
                      onClick={() => handleToggle(rule.id, isChecked)}
                      className={`min-toggle ${isChecked ? "min-toggle-active" : ""}`}
                    >
                      <span className="min-toggle-circle" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
