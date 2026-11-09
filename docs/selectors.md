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

### 1.2 `yt-hide-sidebar` — Hide Left Sidebar
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: Left navigation sidebar / drawer (guide and mini-guide) and homepage video grid centering.
- **Route Scope**: Global (`all`).
- **Selectors**:
  - `ytd-guide-renderer#guide-renderer`
  - `#guide-wrapper`
  - `tp-yt-app-drawer#guide`
  - `ytd-mini-guide-renderer`
  - `#guide-content`
- **Layout Styling (`customCss`)**: Resets YouTube's reserved sidebar margin on `ytd-page-manager#page-manager { margin-left: 0 !important; }` and centers `ytd-browse[page-subtype="home"] ytd-rich-grid-renderer` with `margin: 0 auto !important; justify-content: center !important;`.
- **Reversibility**: Removing `#clearframe-rule-yt-hide-sidebar` restores the default margin and guide visibility.

---

### 1.3 `yt-hide-categories` — Hide Video Categories
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: Filter chip category bar at top of video feed (All, Gaming, Music, Podcasts, etc.).
- **Route Scope**: Home (`home`). Scoped to `url.pathname === '/' || url.pathname === ''`.
- **Selectors**:
  - `ytd-feed-filter-chip-bar-renderer`
  - `#chips-wrapper`
  - `yt-chip-cloud-renderer`
  - `iron-selector#chips`
  - `ytm-feed-filter-chip-bar-renderer`
- **Reversibility**: Removing `#clearframe-rule-yt-hide-categories` immediately restores the topic chip bar.

---

### 1.4 `yt-hide-header-buttons` — Hide Header Buttons
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: Mic (voice search), "+ Create" button, notifications bell, and user profile avatar.
- **Route Scope**: Global (`all`).
- **Selectors**:
  - `#voice-search-button`
  - `ytd-masthead #voice-search-button`
  - `ytd-masthead ytd-button-renderer:has(a[href*="/upload"])`
  - `ytd-masthead ytd-button-renderer:has(button[aria-label*="Create"])`
  - `ytd-masthead ytd-button-renderer:has(button[aria-label*="Crear"])`
  - `ytd-masthead yt-icon-button:has(button[aria-label*="Create"])`
  - `ytd-masthead #buttons ytd-button-renderer:first-child`
  - `ytd-masthead ytd-notification-topbar-button-renderer`
  - `ytd-masthead #notification-button`
  - `ytd-masthead ytd-topbar-menu-button-renderer:has(#avatar-btn)`
  - `ytd-masthead #avatar-btn`
- **Reversibility**: The search bar and logo are preserved; removing the rule restores all header actions.

---

### 1.5 `yt-clean-watch-actions` — Clean Video Action Buttons
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: Cluttered action buttons below video player. Preserves Subscribe, Like/Dislike, and Save to Playlist.
- **Route Scope**: Watch page (`watch`). Scoped to `url.pathname === '/watch'`.
- **Selectors**: Targets Share, Ask (AI), Remix, Thanks, Clip, Download, and the more actions menu (`...`) via localized accessibility attributes and button renderers.
- **Reversibility**: Restores all supplementary buttons upon toggle off.

---

### 1.6 `yt-hide-video-description` — Hide Video Description
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: Expandable video description and metadata details box below video player.
- **Route Scope**: Watch page (`watch`). Scoped to `url.pathname === '/watch'`.
- **Selectors**:
  - `ytd-watch-metadata #description`
  - `ytd-watch-metadata #description-inner`
  - `#meta #description`
  - `ytd-expander.ytd-video-secondary-info-renderer`
  - `ytd-text-inline-expander`
  - `ytm-item-section-renderer[section-identifier="video-description"]`
- **Reversibility**: Removing `#clearframe-rule-yt-hide-video-description` restores description box instantly.

---

### 1.7 `yt-center-watch-player` — Center Video Player & Minimalist Layout
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: Video player and watch columns layout.
- **Route Scope**: Watch page (`watch`). Scoped to `url.pathname === '/watch'`.
- **Layout Styling (`customCss`)**: Enforces `margin: 0 auto !important` and `justify-content: center !important` on `ytd-watch-flexy[flexy] #columns` and `ytd-watch-flexy[flexy] #primary`.
- **Reversibility**: Restores standard side-by-side flex layout when disabled.

---

### 1.8 `yt-hide-related-videos` — Hide Related Videos on Watch Page
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

### 1.9 `yt-hide-comments` — Hide Comments
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

---

## 3. Instagram Adapter (`instagram.com`)

### 3.1 `ig-hide-floating-messages` — Hide Floating Messages Button
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: Persistent floating direct message button pill / widget anchored in the bottom right corner.
- **Route Scope**: Global (`all`).
- **Selectors**:
  - `[data-pagelet="IGDChatTabsRootContent"]`
  - `div:has(> [data-pagelet="IGDChatTabsRootContent"])`
  - `div[role="button"]:has(svg[aria-label*="Messages" i])`
  - `div[role="button"]:has(svg[aria-label*="Mensajes" i])`
  - `div:has(> div > div > svg[aria-label*="Direct" i]):not(nav div)`
- **Reversibility**: Removing `#clearframe-rule-ig-hide-floating-messages` restores the chat widget immediately. The main left navigation Messages link is preserved.

---

### 3.2 `ig-hide-right-sidebar` — Hide Right Sidebar (Suggestions & Profile)
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: Right column containing user profile switcher, "Suggested for you" recommendations, and Meta footer links.
- **Route Scope**: Home (`home`). Scoped to `url.pathname === '/' || url.pathname === ''`.
- **Selectors**:
  - `div[role="complementary"]`
  - `aside`
  - `main ~ div:has(a[href*="/explore/people/"])`
  - `main > div > div > div > div ~ div:has(a[href*="/explore/people/"])`
  - `main > div > div > div ~ div:has(a[href*="/explore/people/"])`
- **Layout Styling (`customCss`)**: Centers the main feed dynamically when the right sidebar is hidden (`main[role="main"]` and `section` with `margin: 0 auto !important; justify-content: center !important`).
- **Reversibility**: Restores the right-side suggestions column and default side-by-side positioning.

---

### 3.3 `ig-hide-feed` — Hide Algorithmic Feed (Focus Mode)
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: Main stream of photo/video posts on the home feed.
- **Route Scope**: Home (`home`). Scoped to `url.pathname === '/' || url.pathname === ''`.
- **Selectors**:
  - `main[role="main"] section article`
  - `main[role="main"] article[role="presentation"]`
  - `main[role="main"] div:has(> article)`
  - `#feed-section`
- **Reversibility**: Removing `#clearframe-rule-ig-hide-feed` restores the home feed immediately. Direct messages, search, and profile pages remain unaffected.

---

### 3.4 `ig-hide-stories-tray` — Hide Stories Tray
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: Top horizontal stories carousel tray on home feed.
- **Route Scope**: Home (`home`). Scoped to `url.pathname === '/' || url.pathname === ''`.
- **Selectors**:
  - `div[role="menu"][aria-label*="Stories" i]`
  - `div[role="menu"][aria-label*="Historias" i]`
  - `main div[role="menu"]`
  - `main div:has(> div > div > div > ul li div[aria-label*="story" i])`
  - `main div:has(> div > ul > li > div[aria-label*="story" i])`
  - `#stories-tray-wrapper`
  - `#stories-tray`
- **Reversibility**: Removing `#clearframe-rule-ig-hide-stories-tray` restores the stories tray instantly.

---

### 3.5 `ig-hide-nav-buttons` — Simplify Navigation (Home, Messages & Profile Only)
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: Left navigation bar items (Reels, Search, Explore, Notifications, Create, More, and Also from Meta / Threads).
- **Route Scope**: Global (`all`).
- **Selectors**: Targets non-essential navigation buttons using accessible labels (`Search`, `Explore`, `Notifications`, `Create`, `More`, `Settings`), destination paths (`/reels/`, `/explore/`, `threads.net`), and action wrappers.
- **Layout Styling (`customCss`)**:
  - Enforces navigation sidebar width (`div[role="navigation"], nav { width: 220px !important; min-width: 220px !important; }`).
  - Forces text labels next to icons to remain permanently visible (`div[role="navigation"] span, nav span { display: inline-block !important; visibility: visible !important; opacity: 1 !important; }`).
- **Reversibility**: Removing `#clearframe-rule-ig-hide-nav-buttons` restores all navigation items and default collapsing rules.

---

## 4. LinkedIn Adapter (`linkedin.com`) — Minimal Theme

### 4.1 `li-hide-feed` — Hide Algorithmic Feed
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: Infinite scrolling home feed (`#voyager-feed`, `.scaffold-finite-scroll`).
- **Route Scope**: Home / Feed (`home`).
- **Selectors**:
  - `#voyager-feed`
  - `.scaffold-finite-scroll`
  - `div[data-view-name="feed-full-feed"]`
  - `main.scaffold-layout__main > div:has(.feed-shared-update-v2)`
  - `main.scaffold-layout__main .scaffold-finite-scroll__content`
  - `#feed-container`
- **Reversibility**: Removing `#clearframe-rule-li-hide-feed` restores the feed. Jobs, Messaging, and Network pages are never affected.

---

### 4.2 `li-hide-promoted` — Hide Promoted Posts & Sponsored Ads
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: Sponsored updates, promoted cards, and sidebar advertising banners.
- **Route Scope**: Global (`all`).
- **Selectors**:
  - `.feed-shared-update-v2:has(.feed-shared-actor--promoted)`
  - `.feed-shared-update-v2:has([data-tracking-control-name*="promoted" i])`
  - `.feed-shared-update-v2:has([data-tracking-control-name*="sponsored" i])`
  - `.feed-shared-update-v2:has(.feed-shared-actor__sub-description[aria-label*="Promoted" i])`
  - `.feed-shared-update-v2:has(.feed-shared-actor__sub-description[aria-label*="Promocionado" i])`
  - `.feed-shared-update-v2[data-ad-banner]`
  - `.ad-banner-container`
  - `.feed-shared-ad`
  - `div[data-ad-banner]`
  - `aside .ad-banner`
- **Reversibility**: Removing `#clearframe-rule-li-hide-promoted` restores sponsored posts. Organic posts are strictly preserved.

---

### 4.3 `li-hide-right-sidebar` — Hide Right Sidebar (News & Trends)
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: Right rail containing LinkedIn News, promoted widgets, and trending topics.
- **Route Scope**: Home / Feed (`home`).
- **Selectors**:
  - `aside.scaffold-layout__aside`
  - `.scaffold-layout__aside`
  - `.news-module`
  - `aside:has(.news-module)`
  - `section:has(#feed-news-module)`
- **Layout Styling (`customCss`)**:
  - Dynamically centers the feed container (`.scaffold-layout__content { display: flex !important; justify-content: center !important; }`).
  - Clears float and sets auto margins (`.scaffold-layout__main { margin: 0 auto !important; float: none !important; }`).
- **Reversibility**: Restores the right sidebar and multi-column grid layout.

---

### 4.4 `li-hide-left-sidebar` — Hide Left Profile & Analytics Sidebar
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: Left sidebar profile identity module, impression counts, and saved items card.
- **Route Scope**: Home / Feed (`home`).
- **Selectors**:
  - `.scaffold-layout__sidebar`
  - `aside.scaffold-layout__sidebar`
  - `.feed-identity-module`
  - `div:has(> .feed-identity-module)`
- **Reversibility**: Restores profile summary module without reloading.

---

### 4.5 `li-hide-floating-messages` — Hide Floating Messaging Popup
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: Floating messaging list bubble anchored in the bottom right corner.
- **Route Scope**: Global (`all`).
- **Selectors**:
  - `#msg-overlay`
  - `.msg-overlay-list-bubble`
  - `.msg-overlay-container`
  - `aside[aria-label*="Messaging" i]`
  - `aside[aria-label*="Mensajes" i]`
- **Reversibility**: Removing `#clearframe-rule-li-hide-floating-messages` restores the drawer. Main top navigation Messaging remains untouched.

---

### 4.6 `li-clean-nav-header` — Simplify Top Navigation Bar
- **Status**: [Unit & DOM Fixture Verified] [Integration Scenario Tested]
- **Target Component**: Premium upsell banners, For Business apps launcher, and Advertise button.
- **Route Scope**: Global (`all`).
- **Selectors**:
  - `.global-nav__secondary-items .premium-upsell-link`
  - `a:has(.global-nav__premium-link)`
  - `.global-nav__nav:has(a[href*="/premium/"]) a[href*="/premium/"]`
  - `.global-nav__app-launcher`
  - `li:has(.global-nav__app-launcher)`
  - `.global-nav__secondary-items li:has(a[href*="/campaignmanager/"])`
- **Reversibility**: Restores secondary launcher controls and upsell links. Essential buttons (Home, My Network, Jobs, Messaging, Notifications) are preserved.



