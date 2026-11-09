import { SelectedElementAnalysis, SelectorCandidate } from './types';

/**
 * Tags that must NEVER be targeted by generated custom rules
 * to prevent catastrophic layout collapse or breaking fundamental page operation.
 */
const CRITICAL_CONTAINER_TAGS = new Set([
  'html',
  'body',
  'head',
  'script',
  'style',
  'meta',
  'link',
  'title',
]);

/**
 * Checks whether an element is a critical root or system container.
 */
export function isCriticalElement(el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  return CRITICAL_CONTAINER_TAGS.has(tag);
}

/**
 * Checks whether an ID appears to be dynamic / randomly generated hash.
 * E.g., :r1:, ember123, ytd-1234, id_0.12345
 */
export function isDynamicId(id: string): boolean {
  if (!id || id.trim().length === 0) return true;
  if (/^[:_]/.test(id)) return true; // React 18 useId() or weird prefix
  if (/\d{4,}/.test(id)) return true; // contains 4+ consecutive digits
  if (/^[a-z0-9]{20,}$/i.test(id)) return true; // hash-like long string
  if (/ember\d+/i.test(id)) return true;
  if (/mount_\d+/i.test(id)) return true;
  return false;
}

/**
 * Checks whether a CSS class name appears to be a dynamic hash (e.g. gvyl4n, css-1dbjc4n, sc-bdVaJa).
 */
export function isDynamicClass(cls: string): boolean {
  if (!cls || cls.trim().length === 0) return true;
  // ClearFrame's own classes
  if (cls.startsWith('clearframe-') || cls.startsWith('cf-') || cls.startsWith('min-')) return true;
  // CSS Modules or styled-components or Tailwind arbitrary or hashes (3-7 random letters/digits)
  if (/^[a-z]{2,5}[0-9a-z]{1,4}$/i.test(cls) && !/^(item|list|card|wrap|post|main|nav|menu|feed|btn|link|icon|text|title)$/i.test(cls)) {
    return true;
  }
  if (/^css-[a-z0-9]+/i.test(cls)) return true;
  if (/^sc-[a-z0-9]+/i.test(cls)) return true;
  if (/_[a-z0-9]{5,}/i.test(cls)) return true;
  return false;
}

/**
 * Safely generates CSS selector candidates for an inspected DOM element.
 * Respects strict hierarchy:
 * 1. Semantic attributes & ARIA roles
 * 2. Stable IDs
 * 3. Stable data attributes (e.g., data-testid, data-component)
 * 4. Stable class combinations
 * 5. Structural ancestry paths
 */
export function generateSelectorCandidates(target: Element, rootDoc: Document = target.ownerDocument): SelectorCandidate[] {
  if (isCriticalElement(target)) {
    return [];
  }

  const candidates: SelectorCandidate[] = [];
  const tag = target.tagName.toLowerCase();

  const addCandidate = (
    selector: string,
    type: SelectorCandidate['type'],
    confidence: SelectorCandidate['confidence'],
    baseSpecificity: number
  ) => {
    try {
      const matches = rootDoc.querySelectorAll(selector);
      const isTargetMatched = Array.from(matches).includes(target);
      if (isTargetMatched) {
        // Check for duplicates
        if (!candidates.some((c) => c.selector === selector)) {
          candidates.push({
            selector,
            matchCount: matches.length,
            confidence,
            type,
            specificity: baseSpecificity,
            isSafe: !matches[0]?.matches('html, body'),
          });
        }
      }
    } catch {
      // Ignore invalid CSS syntax safely
    }
  };

  // 1. Stable ID
  const rawId = target.id;
  if (rawId && !isDynamicId(rawId)) {
    addCandidate(`#${CSS.escape(rawId)}`, 'id', 'high', 100);
    addCandidate(`${tag}#${CSS.escape(rawId)}`, 'id', 'high', 101);
  }

  // 2. Stable Data Attributes (e.g. data-testid, data-component, data-view-name)
  const safeDataAttrs = ['data-testid', 'data-view-name', 'data-component', 'data-item-type', 'data-ad-banner'];
  for (const attr of safeDataAttrs) {
    const val = target.getAttribute(attr);
    if (val && !isDynamicId(val)) {
      addCandidate(`[${attr}="${CSS.escape(val)}"]`, 'data', 'high', 80);
      addCandidate(`${tag}[${attr}="${CSS.escape(val)}"]`, 'data', 'high', 81);
    }
  }

  // 3. ARIA Roles & Accessible Labels
  const role = target.getAttribute('role');
  const ariaLabel = target.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.trim().length > 0 && ariaLabel.length < 50) {
    const cleanLabel = ariaLabel.trim().replace(/"/g, '\\"');
    addCandidate(`[aria-label="${cleanLabel}"]`, 'aria', 'high', 75);
    addCandidate(`${tag}[aria-label="${cleanLabel}"]`, 'aria', 'high', 76);
  }
  if (role && ariaLabel) {
    const cleanLabel = ariaLabel.trim().replace(/"/g, '\\"');
    addCandidate(`[role="${CSS.escape(role)}"][aria-label="${cleanLabel}"]`, 'aria', 'high', 85);
  }

  // 4. Stable CSS Classes
  const classList = Array.from(target.classList).filter((c) => !isDynamicClass(c));
  if (classList.length > 0) {
    // Single stable classes
    for (const cls of classList.slice(0, 3)) {
      addCandidate(`.${CSS.escape(cls)}`, 'class', 'medium', 50);
      addCandidate(`${tag}.${CSS.escape(cls)}`, 'class', 'medium', 51);
    }
    // Combined class pair
    if (classList.length >= 2) {
      const pair = `.${CSS.escape(classList[0])}.${CSS.escape(classList[1])}`;
      addCandidate(pair, 'class', 'medium', 60);
      addCandidate(`${tag}${pair}`, 'class', 'medium', 61);
    }
  }

  // 5. Parent Structural Context
  const parent = target.parentElement;
  if (parent && !isCriticalElement(parent)) {
    const parentTag = parent.tagName.toLowerCase();
    const parentRole = parent.getAttribute('role');
    const parentTestId = parent.getAttribute('data-testid');

    if (parentTestId) {
      addCandidate(`[data-testid="${CSS.escape(parentTestId)}"] > ${tag}`, 'structural', 'medium', 45);
    } else if (parentRole) {
      addCandidate(`[role="${CSS.escape(parentRole)}"] > ${tag}`, 'structural', 'medium', 40);
    } else if (parentTag !== 'div') {
      addCandidate(`${parentTag} > ${tag}`, 'structural', 'low', 30);
    }
  }

  // Sort candidates by confidence (high -> medium -> low) and specificity
  const confidenceOrder = { high: 3, medium: 2, low: 1 };
  candidates.sort((a, b) => {
    const confDiff = confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
    if (confDiff !== 0) return confDiff;
    // Prefer single or reasonably low match count (closer to 1 is more targeted)
    const matchDiff = Math.abs(a.matchCount - 1) - Math.abs(b.matchCount - 1);
    if (matchDiff !== 0) return matchDiff;
    return b.specificity - a.specificity;
  });

  return candidates;
}

/**
 * Analyzes a DOM element for the Inspector dialog.
 */
export function analyzeElement(target: Element, rootDoc: Document = target.ownerDocument): SelectedElementAnalysis {
  const tag = target.tagName.toLowerCase();
  const id = target.id ? target.id : null;
  const classes = Array.from(target.classList).filter((c) => !c.startsWith('clearframe-'));
  const role = target.getAttribute('role');
  const ariaLabel = target.getAttribute('aria-label');

  // Compute bounding box
  const rect = target.getBoundingClientRect();
  const dimensions = {
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };

  // Sample text limited to 60 characters
  const rawText = (target.textContent || '').replace(/\s+/g, ' ').trim();
  const sampleText = rawText.length > 60 ? rawText.substring(0, 57) + '...' : rawText;

  // Generate selector candidates
  const candidates = generateSelectorCandidates(target, rootDoc);
  const bestCandidate = candidates[0];
  const bestSelector = bestCandidate ? bestCandidate.selector : tag;

  // Infer user-friendly suggested component name
  let componentType = 'Element';
  let suggestedName = `${tag.toUpperCase()} Component`;

  if (role) {
    componentType = role.charAt(0).toUpperCase() + role.slice(1);
    suggestedName = `${componentType} Widget`;
  } else if (tag === 'aside') {
    componentType = 'Sidebar';
    suggestedName = 'Side Panel / Bar';
  } else if (tag === 'nav') {
    componentType = 'Navigation';
    suggestedName = 'Navigation Bar';
  } else if (tag === 'article') {
    componentType = 'Card / Post';
    suggestedName = 'Post Card';
  } else if (tag === 'header') {
    componentType = 'Header';
    suggestedName = 'Header Section';
  } else if (tag === 'footer') {
    componentType = 'Footer';
    suggestedName = 'Footer Section';
  }

  if (ariaLabel) {
    suggestedName = ariaLabel;
  } else if (sampleText.length > 0 && sampleText.length < 35) {
    suggestedName = sampleText;
  }

  return {
    tag,
    id,
    classes,
    role,
    ariaLabel,
    sampleText,
    dimensions,
    candidates,
    bestSelector,
    suggestedName,
    componentType,
  };
}
