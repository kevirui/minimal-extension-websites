# LinkedIn Web Reverse UI Analysis & Adapter Integration

- **Target Domain**: `linkedin.com` (`www.linkedin.com`)
- **Adapter ID**: `linkedin`
- **Adapter Name**: `Minimal LinkedIn`
- **Scope**: Home feed (`/feed/`, `/`), All pages (`*`)
- **Evidence Sources**:
  - Runtime DOM inventory: `examples/linkedin example/code.txt` (1,553 elements captured from live session at viewport 1162×917)
  - Network archive: `examples/linkedin example/www.linkedin.com.har` (20 static stylesheet requests from `static.licdn.com`)
  - Classic DOM baseline: LinkedIn Voyager Scaffold layout specifications

---

## 1. Website Structure & Layout Inspection

### 1.1 Layout Architecture
LinkedIn serves two major UI architectures across user cohorts and locales:
1. **Modern CSS-Grid UI (Grid Architecture)**:
   - Root layout container: `div#root`
   - Main scaffold: `main` holding a 3-column semantic structure:
     - Left Rail (`aside[aria-label*="lateral" i]`, `aside[aria-label*="left" i]`): Profile summary, connection metrics, Premium upsell card, bookmarks.
     - Center Rail (`section[aria-label*="principal" i]`, `section[aria-label*="main" i]`): Share box ("Crear publicación"), sorting dropdown, and infinite feed stream (`div[role="list"][data-testid="mainFeed"]`).
     - Right Rail (`aside[aria-label*="margen" i]`, `aside[aria-label*="right" i]`): "LinkedIn News" ("Al margen"), game modules (Zip, Patches, Mini Sudoku), and promoted ad cards.
2. **Classic Scaffold-Layout (Voyager Scaffold)**:
   - Layout scaffold: `.scaffold-layout` with `.scaffold-layout__content`.
   - Left Sidebar: `aside.scaffold-layout__sidebar` containing `.feed-identity-module`.
   - Main Column: `main.scaffold-layout__main` with `#voyager-feed`, `.scaffold-finite-scroll`, and `#feed-container`.
   - Right Sidebar: `aside.scaffold-layout__aside` containing `.news-module` and `.ad-banner-container`.
   - Floating Messaging: `#msg-overlay`, `.msg-overlay-list-bubble`, anchored at the bottom right.

### 1.2 Top Navigation Header
- Semantic container: `<header>` with primary navigation `<nav>` and secondary tools `<nav>`.
- Primary items:
  - `Inicio` (Home): `button` / `a` with `aria-label*="Inicio" i` or `aria-label*="Home" i`.
  - `Mi red` (My Network): `a` with `aria-label*="Mi red" i` or `aria-label*="My Network" i`.
  - `Empleos` (Jobs): `a` with `aria-label*="Empleos" i` or `aria-label*="Jobs" i`.
  - `Mensajes` (Messaging): `a` with `aria-label*="Mensajes" i` or `aria-label*="Messaging" i`.
  - `Notificaciones` (Notifications): `a` with `aria-label*="Notificaciones" i` or `aria-label*="Notifications" i`.
  - Profile menu: `Kevin Agustin Ruiz Yo` (`button`).
- Distracting / Promotional items:
  - "Para negocios" / "For Business": `button[aria-label*="negocios" i]`, `button[aria-label*="business" i]`, `.global-nav__app-launcher`.
  - "Publicidad" / Advertise: `a[aria-label*="Publicidad" i]`, `a[href*="/campaignmanager/"]`.
  - "Try Premium for $0": `a.premium-upsell-link`, `a[href*="/premium/"]`.

---

## 2. DOM & CSS Component Analysis

| Component | Tag & Attributes | CSS Classes (Dynamic) | Semantic / Stable Selectors | Dynamically Generated? | Shadow DOM? |
|---|---|---|---|---|---|
| **Top Nav Upsells & Business** | `button`, `a`, `li` in `<header>` | `gvymiv`, `gvymjv`, etc. | `header li:has(button[aria-label*="negocios" i])`, `header li:has(a[href*="/campaignmanager/"])`, `header li:has(a[href*="/premium/"])`, `.global-nav__app-launcher`, `.premium-upsell-link` | Yes (hydration) | No |
| **Left Profile Rail** | `<aside aria-label="Barra lateral">` | `gvyja3`, `gvyjjd` | `aside[aria-label*="lateral" i]`, `aside[aria-label*="left" i]`, `.scaffold-layout__sidebar`, `.feed-identity-module` | Yes | No |
| **Right News / Trends Rail** | `<aside aria-label="Al margen">` | `gvyja3`, `gvyjd1` | `aside[aria-label*="margen" i]`, `aside[aria-label*="right" i]`, `.scaffold-layout__aside`, `.news-module` | Yes | No |
| **Main Feed Container** | `<div role="list" data-testid="mainFeed">` | `gvyl4n`, `gvyayy` | `div[data-testid="mainFeed"]`, `section[aria-label*="principal" i] div[role="list"]`, `#voyager-feed`, `.scaffold-finite-scroll` | Yes (infinite scroll) | No |
| **Promoted & Sponsored Posts** | `<div role="listitem">` / `.feed-shared-update-v2` | `gvyl4n`, `gvyvo` | `div[data-ad-banner]`, `.feed-shared-update-v2:has(.feed-shared-actor--promoted)`, text content filtering for `Promocionado` / `Promoted` / `Sponsored` | Yes (runtime stream) | No |
| **Floating Messaging Drawer** | `<aside aria-label="Mensajes">` / `#msg-overlay` | `msg-overlay-list-bubble` | `#msg-overlay`, `.msg-overlay-list-bubble`, `aside[aria-label*="Mensajes" i]`, `aside[aria-label*="Messaging" i]` | Yes | Shadow DOM in `#interop-outlet` |

---

## 3. Component Inventory & Selector Reliability Assessment

Selectors are graded on the 6-tier reliability scale:
1. **Tier 1 (Highest)**: Semantic elements with stable ARIA roles and labels (e.g. `aside[aria-label*="lateral" i]`, `div[role="list"]`).
2. **Tier 2**: Stable test/data attributes (e.g. `div[data-testid="mainFeed"]`, `div[data-ad-banner]`).
3. **Tier 3**: Stable navigational URLs (e.g. `a[href*="/premium/"]`, `a[href*="/campaignmanager/"]`).
4. **Tier 4**: Structural relationships with `:has()` (e.g. `header li:has(button[aria-label*="negocios" i])`).
5. **Tier 5**: Well-known scaffold class names (e.g. `.scaffold-layout__aside`, `.scaffold-finite-scroll`).
6. **Tier 6 (Fragile - Avoided)**: Obfuscated generated hash class names (`.gvyll3`, `.gvyl4n`, etc.).

| Component | Purpose | Selector Candidates | Reliability | Proposed Rule |
|---|---|---|---|---|
| **Top Navigation Upsells** | Remove upsell links & app launchers from navigation header | `header li:has(button[aria-label*="negocios" i])`, `header li:has(a[href*="/campaignmanager/"])`, `header li:has(a[href*="/premium/"])`, `.global-nav__app-launcher`, `.premium-upsell-link` | Tier 1-4 (High) | `li-clean-nav-header` |
| **Left Profile Sidebar** | Remove profile identity module, impression counts, and creator tools | `aside[aria-label*="lateral" i]`, `aside[aria-label*="left" i]`, `.scaffold-layout__sidebar`, `.feed-identity-module` | Tier 1, 5 (High) | `li-hide-left-sidebar` |
| **Right News Sidebar** | Remove news module, games widget, and sidebar ads; center feed | `aside[aria-label*="margen" i]`, `aside[aria-label*="right" i]`, `.scaffold-layout__aside`, `.news-module` | Tier 1, 5 (High) | `li-hide-right-sidebar` |
| **Infinite Feed Stream** | Eliminate doomscrolling feed stream while preserving search & header | `div[data-testid="mainFeed"]`, `section[aria-label*="principal" i] div[role="list"]`, `#voyager-feed`, `.scaffold-finite-scroll` | Tier 1, 2, 5 (High) | `li-hide-feed` |
| **Promoted Posts & Ads** | Remove sponsored feed items while strictly keeping organic posts | `.feed-shared-update-v2:has(.feed-shared-actor--promoted)`, `div[data-ad-banner]`, `.ad-banner-container`, JS DOM text node inspection | Tier 2, 4 (High) | `li-hide-promoted` |
| **Floating Messaging Overlay** | Hide docked bottom-right chat bubble drawer | `#msg-overlay`, `.msg-overlay-list-bubble`, `aside[aria-label*="Mensajes" i]`, Shadow DOM `#interop-outlet` | Tier 1, 5 (High) | `li-hide-floating-messages` |

---

## 4. Implemented Rules & User Experience

Each rule is defined independently in `src/adapters/linkedin.ts`:

1. **`li-clean-nav-header`** (`Simplify Navigation`):
   - Scope: `all`
   - Default: `false`
   - Behavior: Hides business launchers, advertise links, and Try Premium upsells. Preserves search input, notifications, messaging, network, and jobs links.
2. **`li-hide-left-sidebar`** (`Hide Left Pane`):
   - Scope: `home` (`/` or `/feed/`)
   - Default: `false`
   - Behavior: Hides profile identity and connection metrics module.
3. **`li-hide-right-sidebar`** (`Hide Right Pane`):
   - Scope: `home` (`/` or `/feed/`)
   - Default: `false`
   - Behavior: Hides LinkedIn News, daily puzzle games, and sidebar ads; injects CSS to center the main content area (`section[aria-label*="principal" i]` and `.scaffold-layout__main`).
4. **`li-hide-feed`** (`Simplify Feed`):
   - Scope: `home` (`/` or `/feed/`)
   - Default: `false`
   - Behavior: Hides the infinite scrolling list of feed posts.
5. **`li-hide-promoted`** (`Hide Promoted Posts & Sponsored Ads`):
   - Scope: `all`
   - Default: `true`
   - Behavior: Selectively matches and hides ads and sponsored posts across English and Spanish locales. Keeps all organic connection updates visible.
6. **`li-hide-floating-messages`** (`Hide Floating Messaging`):
   - Scope: `all`
   - Default: `false`
   - Behavior: Hides the bottom-right floating messaging drawer. Inspects standard DOM and Shadow DOM hosts (`#interop-outlet`).

---

## 5. Known Limitations & Edge Cases

1. **Shadow DOM Messaging**: Modern LinkedIn loads messaging modules inside `#interop-outlet` closed/open shadow roots in some A/B testing cohorts. The adapter handles this with a dedicated `apply()` handler scanning `doc.querySelectorAll('#interop-outlet')`.
2. **Internationalization**: ARIA labels differ across languages (e.g., `Barra lateral` in Spanish vs. `Left sidebar` in English; `Al margen` vs. `Right sidebar`). Rules utilize case-insensitive attribute substring selectors (`[aria-label*="lateral" i]`, `[aria-label*="margen" i]`, `[aria-label*="left" i]`, `[aria-label*="right" i]`) to guarantee international compatibility.
3. **Dynamic Infinite Scrolling**: Newly loaded feed items are intercepted declaratively via injected CSS styles and dynamic cleanup observers in `apply()`.

---

## 6. Verification Results

- **DOM Fixture Verification**: Validated in `src/adapters/selectors.test.ts` across 6 test suites targeting both modern and classic structures.
- **Route Applicability Testing**: Validated in `src/adapters/applicability.test.ts` ensuring homepage-scoped rules deactivate cleanly on `/jobs/`, `/mynetwork/`, and `/messaging/`.
- **Reversibility & Isolation**: Validated in `src/test/integration.test.ts` confirming enabling and disabling individual rules completely removes style tags without leaking.
- **Build Verification**: Compiled cleanly using `npm run build` (`wxt build`) producing zero bundle errors with all assets generated in `.output/chrome-mv3`.

