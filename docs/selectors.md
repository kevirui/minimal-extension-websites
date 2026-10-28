# Selectors & Site Adapter Reference: ClearFrame

This document records the exact CSS selectors used by ClearFrame, the target surface on which they apply, the user-facing rationale, dynamic handling, reversibility, and known fragility or edge-case limitations.

---

## Verification Legend

- **[Unit & DOM Fixture Verified]**: Tested deterministically against real representative DOM structures extracted from live site snapshots.
- **[Integration Scenario Tested]**: Verified across simulated multi-page SPA route navigations, initial loads, toggles, and reversibility cycles.
- **[Manual Live Browser Verified]**: Verified by inspection in Chromium developer mode.

---

## 1. YouTube Adapter (`youtube.com`)

### 1.1 `yt-hide-shorts` — Hide Shorts
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: Algorithmic short-form video shelves, drawer links, and mobile tabs.
- **Route Scope**: Global (`all`).
- **Selectors**:
  - `ytd-guide-entry-renderer:has(a[title="Shorts"])`
  - `ytd-guide-entry-renderer:has(a[href^="/shorts"])`
  - `ytd-mini-guide-entry-renderer:has(a[title="Shorts"])`
  - `ytd-mini-guide-entry-renderer:has(a[href^="/shorts"])`
  - `ytd-rich-shelf-renderer[is-shorts]`
  - `ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])`
  - `ytd-reel-shelf-renderer`
  - `yt-tab-shape[tab-title="Shorts"]`
  - `ytm-reel-shelf-renderer`
  - `ytm-pivot-bar-item-renderer:has(div.pivot-shorts)`
- **Dynamic Rendering**: Managed declaratively by injecting `<style id="clearframe-rule-yt-hide-shorts">`. Any newly rendered shelf instantly matches without DOM scanning.
- **Reversibility**: Disabling the rule removes `#clearframe-rule-yt-hide-shorts`, immediately restoring default display without touching parent containers or sibling videos.
- **Fragility & Limitations**: In foreign locales where `title="Shorts"` is translated, the `[href^="/shorts"]` and `[is-shorts]` attribute selectors act as robust international fallbacks.

---

### 1.2 `yt-hide-home-feed` — Hide Home Recommendations
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: Algorithmic video recommendation grid on the primary homepage.
- **Route Scope**: Homepage (`home`). Scoped strictly to `url.pathname === '/'`.
- **Selectors**:
  - `ytd-browse[page-subtype="home"] #contents.ytd-rich-grid-renderer`
  - `ytd-browse[page-subtype="home"] ytd-rich-grid-renderer`
  - `ytm-browse[page-subtype="home"] .tab-content`
- **Dynamic Rendering**: Controlled by declarative CSS applied only while on `/`. When navigating to a watch page or search query via YouTube SPA router (`yt-navigate-finish`), the engine automatically cleans up the style element.
- **Reversibility**: Removing the style restores the rich grid in full. Top search bar, masthead, and account menus are outside the selector tree and remain fully interactive.
- **Fragility & Limitations**: If YouTube deprecates `[page-subtype="home"]`, the fallback is the route-level applicability check enforced by `RuleEngine`.

---

### 1.3 `yt-hide-related-videos` — Hide Related Videos on Watch Page
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: Secondary sidebar recommendation column on video watch pages.
- **Route Scope**: Watch page (`watch`). Scoped to `url.pathname === '/watch'`.
- **Selectors**:
  - `ytd-watch-flexy #secondary #related`
  - `ytd-watch-grid #secondary #related`
  - `#related.ytd-watch-flexy`
  - `ytm-item-section-renderer[section-identifier="related-items"]`
- **Dynamic Rendering**: Applied on watch pages. Cleaned up immediately when navigating back to search or home.
- **Reversibility**: Strictly targets `#related` within `#secondary`. Live chat, chapter panels, and playlist drawers occupying `#secondary` are preserved.
- **Fragility & Limitations**: YouTube experiments with `ytd-watch-grid` in certain A/B tests; both flexy and grid variants are included.

---

### 1.4 `yt-hide-comments` — Hide Comments
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: User comments container on watch pages.
- **Route Scope**: Watch page (`watch`). Scoped to `url.pathname === '/watch'`.
- **Selectors**:
  - `ytd-comments#comments`
  - `#comments.ytd-watch-flexy`
  - `#comments.ytd-watch-grid`
  - `ytm-comments-entry-point-teaser-renderer`
  - `ytm-comment-section-renderer`
- **Dynamic Rendering**: Declarative CSS hiding applied on `/watch`.
- **Reversibility**: Removing `#clearframe-rule-yt-hide-comments` unhides comments without requiring page reload. Video player controls, description, and subscription buttons remain intact.

---

## 2. Reddit Adapter (`reddit.com`)

### 2.1 `reddit-hide-promoted` — Hide Promoted Posts & Ads
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: Sponsored advertisement posts and promoted cards.
- **Route Scope**: Global (`all`).
- **Selectors**:
  - `shreddit-ad-post`
  - `shreddit-dynamic-ad-link`
  - `div[data-testid="ad-post"]`
  - `div[data-promoted="true"]`
  - `.promotedlink`
  - `.thing.promoted`
  - `.thing.sponsor`
- **Dynamic Rendering**: Infinite scrolling feeds dynamically append `<shreddit-ad-post>`. Declarative CSS suppresses them instantaneously without observer overhead.
- **Reversibility**: Removing `#clearframe-rule-reddit-hide-promoted` restores ad visibility. Organic post articles are never matched.

---

### 2.2 `reddit-hide-sidebar-recommendations` — Hide Recent Posts & Recommendations
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: "Recent Posts" navigation history card and algorithmic recommendation carousels.
- **Route Scope**: Feed (`feed`). Inapplicable on direct comment threads (`/comments/`).
- **Selectors**:
  - `shreddit-recent-posts`
  - `aside[aria-label="Recent Posts"]`
  - `#recent-posts-card`
  - `shreddit-feed-carousel[data-testid="recommended-carousel"]`
- **Dynamic Rendering**: Declaratively hidden on feeds.
- **Reversibility**: Removing `#clearframe-rule-reddit-hide-sidebar-recommendations` restores the widget. Subreddit rules, moderators, and sidebar community information remain visible.
