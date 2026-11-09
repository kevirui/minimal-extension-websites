# Inspector Mode: Visual Element Selection & Custom Blocking

ClearFrame Inspector Mode provides a non-technical, visual mechanism for users to point, click, preview, and permanently hide any unwanted component or clutter on supported websites.

---

## 1. Architecture & Design Principles

```
┌────────────────────────────────────────────────────────┐
│                   Popup UI (PopupApp)                   │
│   • "Inspect" button trigger                           │
│   • "Custom Rules" list with toggles and delete action │
└───────────────────────────┬────────────────────────────┘
                            │ chrome.tabs.sendMessage
                            ▼
┌────────────────────────────────────────────────────────┐
│               Content Script Runtime                   │
│   • Listens for CLEARFRAME_START_INSPECTOR             │
│   • Initializes InspectorOverlay                       │
│   • Applies custom rules via RuleEngine                │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
              ▼                            ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│     InspectorOverlay     │  │    inspectorAnalyzer     │
│  • Visual hover box      │  │  • Semantic ordering     │
│  • Event suppression     │  │  • Hash/class filtering  │
│  • Reversible preview    │  │  • Critical tag protect  │
│  • Dialog & naming       │  │  • Repeated card count   │
└──────────────────────────┘  └──────────────────────────┘
```

### Core Design Guarantees:
1. **Reversible**: Previews and saved rules use isolated, dedicated `<style>` tags with unique IDs (`#clearframe-custom-{ruleId}`). No permanent inline style mutations.
2. **Domain-Isolated**: Rules are tagged with `rule.hostname` and persisted in storage under `customRules`. LinkedIn rules are never evaluated or injected on Instagram or YouTube.
3. **Safe by Design**: Critical structural tags (`html`, `body`, `head`, `script`, `style`) cannot be targeted. Dynamic hashes (e.g. `:r1:`, `gvyl4n`, `css-1dbjc4n`) are discarded in favor of semantic IDs, ARIA attributes, and data attributes.
4. **No Multiple Observers**: Custom rules are registered directly with the existing `RuleEngine`, ensuring that DOM subtree mutations, dynamic content loading, and SPA navigations reuse the existing debounced lifecycle.

---

## 2. Inspector States & User Flow

```
[ Inactive ]
     │ User clicks "Inspect" in Popup
     ▼
[ Selecting ] ── (Hover) ──> Floating highlight box follows mouse pointer
     │                      Clicks on links/buttons are suppressed & intercepted
     │ (User clicks element)
     ▼
[ Selected ] ──> Inspector Dialog displays:
     │           • Suggested human-readable name (e.g., "Trending News")
     │           • Evaluated selector candidates ordered by confidence
     │           • Match count (single element vs. repeated cards)
     │           • Action buttons: [Preview / Restore], [Cancel], [Save Rule]
     │
     ├──> [ Previewing ] (Toggles non-destructive CSS display:none)
     │
     ▼ (User confirms "Save Rule")
[ Saving ] ──> Persists via WriteMutex to storage -> RuleEngine applies -> Overlay closes
```

---

## 3. Selector Generation Hierarchy & Reliability

The `inspectorAnalyzer` generates candidates according to the 6-tier reliability rubric:

1. **Tier 1 (Semantic & Data Attributes)**:
   - `[data-testid="..."]`, `[data-component="..."]`, `[data-view-name="..."]`
   - ARIA labels and roles: `[role="..."][aria-label="..."]`, `[aria-label="..."]`
2. **Tier 2 (Stable IDs)**:
   - `#header-widget`, `aside#sidebar-news` (excluding hashes with digits ≥ 4 or dynamic prefixes like `:r1:`).
3. **Tier 3 (Semantic HTML Elements)**:
   - `aside`, `nav`, `header`, `footer`, `article` combined with stable classes.
4. **Tier 4 (Structural Ancestry)**:
   - `[data-testid="feed-list"] > div`, `nav > ul > li`.
5. **Excluded (Fragile / Dangerous)**:
   - Dynamic hashed class names (`gvyl4n`, `css-1dbjc4n`, `_hash123`).
   - Root elements (`html`, `body`).

---

## 4. Custom Rule Persistence Format

Custom rules are stored alongside standard adapter configurations inside `PersistedAppSettings`:

```ts
interface CustomRule {
  id: string;             // e.g. "custom-1718000000000-a8f3b"
  name: string;           // e.g. "Suggested Connections Card"
  hostname: string;       // e.g. "www.linkedin.com"
  selector: string;       // e.g. "[aria-label='Suggested for you']"
  enabled: boolean;       // true / false
  createdAt: number;      // Epoch timestamp
  strategy: 'hide';       // Extensible for future operations
  targetMode?: 'single' | 'all'; // Informs user if multiple cards match
  version: number;        // Schema version (1)
}
```

---

## 5. Verification & Testing

### Automated Test Suites:
- **`src/core/inspectorAnalyzer.test.ts`**:
  - Validates rejection of root/critical containers (`html`, `body`).
  - Validates dynamic class & hash ID filtering.
  - Validates ARIA role/label extraction and candidate ordering.
  - Validates accurate match calculation across repeated post cards.
- **`src/core/inspectorOverlay.test.ts`**:
  - Tests activation, hover highlight rendering, and cleanup.
  - Verifies cancellation via `Escape` key.
  - Verifies default prevention on clicks (user does not navigate away during selection).
  - Verifies reversible preview injection and removal.
- **`src/core/storage.test.ts`**:
  - Validates saving, retrieval, domain filtering, and deletion of custom rules.
- **`src/test/integration.test.ts`**:
  - Scenario G: Tests end-to-end custom rule application in `RuleEngine`, live CSS insertion, dynamic toggling, and clean destruction.

### Manual Verification in Chrome:
1. Load unpacked extension from `.output/chrome-mv3` in `chrome://extensions`.
2. Navigate to `https://www.linkedin.com` or `https://www.youtube.com`.
3. Click ClearFrame icon in the toolbar.
4. Click the **Inspect** button in the popup header.
5. Hover over any unwanted element (e.g., an ad banner or recommendation rail).
6. Click the element. The confirmation dialog will open showing the detected component and candidates.
7. Click **Preview** to see the element disappear in real time. Click **Restore** to bring it back.
8. Click **Save Rule**. The component disappears and will remain hidden across page reloads and SPA navigations.
9. Open ClearFrame popup: the rule appears in the **CUSTOM RULES** section with toggle and delete controls.

