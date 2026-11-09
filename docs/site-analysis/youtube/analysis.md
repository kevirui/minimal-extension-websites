# YouTube Web Reverse UI Analysis & Adapter Integration

- **Target Domain**: `youtube.com` (`www.youtube.com`, `m.youtube.com`)
- **Adapter ID**: `youtube`
- **Adapter Name**: `Minimal YouTube`
- **Scope**: Home feed (`/`), Watch page (`/watch`), Search results (`/results`), All pages (`*`)
- **Evidence Sources**:
  - Runtime DOM inventory: `examples/youtube example/code.txt` (3,444 elements captured from live session at viewport 1162×917)
  - Network archive: `examples/youtube example/www.youtube.com.har` (4.08 MB network traffic & stylesheets)

---

## 1. Website Structure & Layout Inspection

### 1.1 Layout Architecture
YouTube uses custom web components running inside `ytd-app`:
- **Top Bar (`<ytd-masthead id="masthead">`)**:
  - Logo (`ytd-topbar-logo-renderer`)
  - Search container (`#search`, `form#search-form`)
  - Voice search button (`#voice-search-button`)
  - End buttons: Create button (`#buttons ytd-button-renderer`), Notifications bell (`ytd-notification-topbar-button-renderer`), Profile avatar (`#avatar-btn`).
- **Guide Drawer Navigation**:
  - Full guide drawer: `tp-yt-app-drawer#guide` containing `ytd-guide-renderer`.
  - Mini guide drawer (compact view): `ytd-mini-guide-renderer` with `ytd-mini-guide-entry-renderer`.
- **Primary Content View (`ytd-page-manager#page-manager`)**:
  - Home feed: `ytd-browse[page-subtype="home"]` with category chips (`ytd-feed-filter-chip-bar-renderer`) and video grid (`ytd-rich-grid-renderer`).
  - Watch page: `ytd-watch-flexy` with primary player (`#player`), action buttons below player, description box, comments stream (`#comments`, `ytd-comments`), and related videos secondary column (`#secondary`, `ytd-watch-next-secondary-results-renderer`).

---

## 2. DOM & CSS Component Analysis

| Component | Tag & Attributes | Semantic / Stable Selectors | Dynamically Generated? | Shadow DOM? |
|---|---|---|---|---|
| **Shorts Shelves & Links** | `ytd-rich-shelf-renderer`, `ytd-reel-shelf-renderer` | `ytd-guide-entry-renderer:has(a[href^="/shorts"])`, `ytd-rich-shelf-renderer[is-shorts]`, `ytd-reel-shelf-renderer` | Yes | Custom element |
| **Category Chips Bar** | `ytd-feed-filter-chip-bar-renderer` | `ytd-feed-filter-chip-bar-renderer`, `yt-chip-cloud-renderer` | Yes | Custom element |
| **Left Sidebar Drawer** | `ytd-guide-renderer`, `tp-yt-app-drawer` | `ytd-guide-renderer#guide-renderer`, `tp-yt-app-drawer#guide`, `ytd-mini-guide-renderer` | Yes | Custom element |
| **Header Buttons** | Mic, Create, Notifications | `#voice-search-button`, `ytd-masthead ytd-notification-topbar-button-renderer`, `ytd-masthead #avatar-btn` | Yes | Custom element |
| **Watch Comments** | `ytd-comments#comments` | `ytd-comments#comments`, `#comments` | Yes | Custom element |
| **Related Videos** | `ytd-watch-next-secondary-results-renderer` | `#secondary #related`, `ytd-watch-next-secondary-results-renderer` | Yes | Custom element |
| **Watch Description** | `#description`, `#description-inner` | `ytd-watch-metadata #description`, `#description.ytd-watch-metadata` | Yes | Custom element |

---

## 3. Implemented Rules & Selectors

1. **`yt-hide-shorts`** (`Hide Shorts`):
   - Targets algorithmic short-form shelves, guide links, and tabs.
2. **`yt-hide-sidebar`** (`Hide Left Sidebar`):
   - Hides guide drawer and centers homepage grid via layout CSS reset.
3. **`yt-hide-categories`** (`Hide Video Categories`):
   - Hides top chip topic filters.
4. **`yt-hide-header-buttons`** (`Hide Header Buttons`):
   - Hides mic, upload, bell, and avatar while strictly keeping search and logo.
5. **`yt-clean-watch-actions`** (`Clean Video Action Buttons`):
   - Removes distracting auxiliary buttons (Remix, Thanks, Clip, Download) while preserving Like and Subscribe.
6. **`yt-hide-video-description`** (`Hide Video Description`):
   - Hides expandable description box.
7. **`yt-hide-comments`** (`Hide Comments`):
   - Hides comments section on watch pages.
8. **`yt-hide-related-videos`** (`Hide Related Videos`):
   - Hides the recommendation sidebar next to playing videos.
9. **`yt-hide-home-feed`** (`Hide Home Feed`):
   - Hides the algorithmic browse grid on the homepage.

---

## 4. Verification Results

- Verified in `src/adapters/selectors.test.ts` against `youtubeHomeFixture` and `youtubeWatchFixture`.
- Tested in `src/test/integration.test.ts` across multi-route SPA transitions (`/` -> `/watch?v=123` -> `/results` -> `/`).
- Validated build in `wxt build`.

