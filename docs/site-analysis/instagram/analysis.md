# Instagram Web Reverse UI Analysis & Adapter Integration

- **Target Domain**: `instagram.com` (`www.instagram.com`)
- **Adapter ID**: `instagram`
- **Adapter Name**: `Instagram`
- **Scope**: Home feed (`/`), All pages (`*`)
- **Evidence Sources**:
  - Runtime DOM inventory: `examples/instagram example/code.txt` (1,019 elements captured from live session at viewport 1162×917)
  - Network archive: `examples/instagram example/www.instagram.com.har` (2.37 MB network traffic & stylesheets)
  - Visual Theme Concept: Neo-Dark Dashboard Theme with custom dark slate/indigo background, rounded card surfaces, stories carousel glow, coral accent gradients, and streamlined typography.

---

## 1. Website Structure & Layout Inspection

### 1.1 Layout Architecture
Instagram operates as a modern single-page React application rooted at `div#mount_0_0_*`:
- **Left Navigation Rail**: Contains the Instagram wordmark/icon, primary navigation links (Home, Search, Explore, Reels, Messages, Notifications, Create, Profile, More).
- **Center Content Stream**: `<main role="main">` housing:
  - Stories Tray: Top horizontal carousel with user avatars and status rings.
  - Main Post Feed: `<article>` elements displaying imagery, caption, likes, and comments.
- **Right Sidebar (Suggestions for you)**: User profile switch card, "Suggested for you" recommendations, and footer copyright links.
- **Floating Messages Drawer**: Persistent chat widget docked at the bottom right corner.

---

## 2. Implemented Rules & Theme Features

1. **`ig-theme-modern-dark`** (`Neo-Dark Minimalist Theme`):
   - **Visual Identity**: Replaces standard Instagram styling with a minimalist dark slate palette (`#1e1f28` canvas, `#272834` surfaces, `#282a36` cards, `#323545` borders).
   - **Post Cards & Feeds**: Wraps posts in rounded containers (`18px` border-radius) with soft ambient drop-shadows (`0 10px 30px rgba(0, 0, 0, 0.25)`).
   - **Stories Tray Glow**: Enhances story avatars with neon coral/amber ring gradients and subtle drop-shadow filters.
   - **Pill Buttons & Search**: Modern rounded inputs and coral gradient action buttons (`linear-gradient(135deg, #ff5e62, #ff9966)`).
   - **Clean Sidebar**: Dark indigo left navigation bar with smooth hover highlights.
2. **`ig-hide-floating-messages`** (`Hide Floating Messages Button`):
   - Scope: `all`
   - Selectors: `[data-pagelet="IGDChatTabsRootContent"]`, floating chat button pills.
3. **`ig-hide-right-sidebar`** (`Hide Right Sidebar (Suggestions & Profile)`):
   - Scope: `home`
   - Selectors: `div[role="complementary"]`, `aside`, right column suggestions container; dynamically centers main feed.
4. **`ig-hide-feed`** (`Hide Algorithmic Feed (Focus Mode)`):
   - Scope: `home`
   - Selectors: `main[role="main"] section article`, `main[role="main"] article[role="presentation"]`.
5. **`ig-hide-stories-tray`** (`Hide Stories Tray`):
   - Scope: `home`
   - Selectors: `div[role="menu"][aria-label*="Stories" i]`, top carousel tray.
6. **`ig-hide-nav-buttons`** (`Simplify Navigation`):
   - Scope: `all`
   - Selectors: Reels, Search, Explore, Notifications, Create, More, and Threads links.

---

## 3. Verification Results

- Verified in `src/adapters/selectors.test.ts` (includes customCss token validation).
- Verified in `src/adapters/applicability.test.ts` across routes.
- Verified in `src/test/integration.test.ts` end-to-end integration suite.
- Clean production build generated with `wxt build` (332.77 kB in `.output/chrome-mv3`).
