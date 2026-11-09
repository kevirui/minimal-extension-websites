import { SiteAdapter } from '../core/types';

/**
 * LinkedIn Site Adapter
 * Provides targeted, independent rules to declutter LinkedIn into a minimal,
 * distraction-free experience inspired by "Minimal Theme for LinkedIn".
 *
 * Supports both:
 * 1. Modern CSS-Grid LinkedIn layout (using semantic attributes, aria-labels, componentkey)
 * 2. Classic Scaffold-Layout LinkedIn layout (.scaffold-layout__aside, .scaffold-layout__sidebar, #voyager-feed)
 */
export const linkedinAdapter: SiteAdapter = {
  id: 'linkedin',
  name: 'Minimal LinkedIn',
  matches: [
    'linkedin.com',
    '*.linkedin.com',
  ],
  rules: [
    {
      id: 'li-clean-nav-header',
      label: 'Simplify Navigation',
      description: 'Hides Try Premium promotions, business shortcuts, and sub-labels under nav icons for a clean, minimal top bar.',
      defaultEnabled: false,
      scope: 'all',
      selectors: [
        // Modern navigation promotional buttons & links
        'header li:has(button[aria-label*="negocios" i])',
        'header li:has(button[aria-label*="business" i])',
        'header li:has(a[href*="/campaignmanager/"])',
        'header li:has(a[href*="/premium/"])',
        'header li:has(a[href*="/learning/"])',
        // Hide sub-labels/text below navigation icons (Inicio, Mi red, Empleos, Mensajes, Notificaciones, Más)
        'header nav li button > span:nth-child(2)',
        'header nav li a > span:nth-child(2)',
        'header nav li button > span:has(> span:not(:has(svg)))',
        'header nav li a > span:has(> span:not(:has(svg)))',
        'header figure ~ div',
        'header [aria-label*="Yo" i] figure ~ div',
        'header [aria-label*="Me" i] figure ~ div',
        'header [aria-label*="Yo" i] p',
        'header [aria-label*="Me" i] p',
        // Classic nav selectors
        '.global-nav__secondary-items .premium-upsell-link',
        'a:has(.global-nav__premium-link)',
        '.global-nav__nav:has(a[href*="/premium/"]) a[href*="/premium/"]',
        '.global-nav__app-launcher',
        'li:has(.global-nav__app-launcher)',
        '.global-nav__secondary-items li:has(a[href*="/campaignmanager/"])',
        '.global-nav__primary-link-text',
        '.global-nav__item-text',
      ],
      customCss: `
/* Keep nav items compact and icons vertically centered without the text labels */
header nav li button,
header nav li a {
  min-height: 48px !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
}
`,
    },
    {
      id: 'li-hide-left-sidebar',
      label: 'Hide Left Pane',
      description: 'Hides the left sidebar profile summary card, analytics links, and saved items widget.',
      defaultEnabled: false,
      scope: 'home',
      isApplicable: (url: URL) => url.pathname === '/' || url.pathname === '' || url.pathname.includes('/feed'),
      selectors: [
        // Modern LinkedIn left rail
        'aside[aria-label*="lateral" i]',
        'aside[aria-label*="left" i]',
        'aside:has(a[href*="/in/"][data-view-name*="profile" i])',
        'aside:has(div[componentkey*="profile" i])',
        // Classic scaffold layout
        '.scaffold-layout__sidebar',
        'aside.scaffold-layout__sidebar',
        '.feed-identity-module',
        'div:has(> .feed-identity-module)',
      ],
      customCss: `
/* Ensure main column stays centered if left rail is also removed */
.scaffold-layout__content {
  justify-content: center !important;
}
`,
    },
    {
      id: 'li-hide-right-sidebar',
      label: 'Hide Right Pane',
      description: 'Hides the right sidebar containing LinkedIn News, trending topics, and promoted widgets, and centers the main feed.',
      defaultEnabled: false,
      scope: 'home',
      isApplicable: (url: URL) => url.pathname === '/' || url.pathname === '' || url.pathname.includes('/feed'),
      selectors: [
        // Modern LinkedIn right rail
        'aside[aria-label*="margen" i]',
        'aside[aria-label*="right" i]',
        'aside:has(#feedRightNavGamesComponentRef)',
        'aside:has([componentkey*="feedRightNav" i])',
        // Classic scaffold layout
        'aside.scaffold-layout__aside',
        '.scaffold-layout__aside',
        '.news-module',
        'aside:has(.news-module)',
        'section:has(#feed-news-module)',
      ],
      customCss: `
/* Modern LinkedIn CSS Grid centering when right sidebar is hidden */
div:has(> section[aria-label*="principal" i]),
div:has(> section[aria-label*="main" i]) {
  justify-content: center !important;
}

section[aria-label*="principal" i],
section[aria-label*="main" i] {
  grid-column-start: 5 !important;
  grid-column-end: 21 !important;
  max-width: 800px !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

/* Classic scaffold layout centering */
.scaffold-layout__content {
  display: flex !important;
  justify-content: center !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

.scaffold-layout__main {
  margin-left: auto !important;
  margin-right: auto !important;
  float: none !important;
}
`,
    },
    {
      id: 'li-hide-feed',
      label: 'Simplify Feed',
      description: 'Hides the infinite feed stream on the homepage to prevent doomscrolling while keeping messages and jobs accessible.',
      defaultEnabled: false,
      scope: 'home',
      isApplicable: (url: URL) => url.pathname === '/' || url.pathname === '' || url.pathname.includes('/feed'),
      selectors: [
        // Modern LinkedIn feed list
        'div[componentkey="container-update-list_mainFeed-lazy-container"]',
        'section[aria-label*="principal" i] div[role="list"]',
        'section[aria-label*="main" i] div[role="list"]',
        // Classic feed containers
        '#voyager-feed',
        '.scaffold-finite-scroll',
        'div[data-view-name="feed-full-feed"]',
        'main.scaffold-layout__main > div:has(.feed-shared-update-v2)',
        'main.scaffold-layout__main .scaffold-finite-scroll__content',
        '#feed-container',
      ],
    },
    {
      id: 'li-hide-floating-messages',
      label: 'Hide Floating Messaging',
      description: 'Hides the persistent messaging drawer / chat bubble overlay docked at the bottom right corner.',
      defaultEnabled: false,
      scope: 'all',
      selectors: [
        // Classic DOM and overlay
        '#msg-overlay',
        '.msg-overlay-list-bubble',
        '.msg-overlay-container',
        'aside[aria-label*="Messaging" i]',
        'aside[aria-label*="Mensajes" i]',
      ],
      apply: (doc: Document) => {
        // Shadow DOM aware hide for modern LinkedIn #interop-outlet messaging
        const checkShadowOverlay = () => {
          const shadowHosts = doc.querySelectorAll('#interop-outlet, div[data-testid="interop-shadowdom"]');
          shadowHosts.forEach((host) => {
            const root = host.shadowRoot;
            if (root) {
              const msgAside = root.querySelector('#msg-overlay, .msg-overlay-container, aside[aria-label*="Mensajes" i], aside[aria-label*="Messaging" i]');
              if (msgAside) {
                (msgAside as HTMLElement).style.setProperty('display', 'none', 'important');
                msgAside.setAttribute('data-clearframe-hidden', 'true');
              }
            }
          });
        };

        checkShadowOverlay();

        return () => {
          const shadowHosts = doc.querySelectorAll('#interop-outlet, div[data-testid="interop-shadowdom"]');
          shadowHosts.forEach((host) => {
            const root = host.shadowRoot;
            if (root) {
              const hidden = root.querySelectorAll('[data-clearframe-hidden="true"]');
              hidden.forEach((el) => {
                (el as HTMLElement).style.removeProperty('display');
                el.removeAttribute('data-clearframe-hidden');
              });
            }
          });
        };
      },
    },
    {
      id: 'li-hide-promoted',
      label: 'Hide Promoted Posts & Sponsored Ads',
      description: 'Hides sponsored updates, promoted employer posts, and promotional banner ads across the feed.',
      defaultEnabled: true,
      scope: 'all',
      selectors: [
        // Standalone ads & promoted banners
        '.ad-banner-container',
        '.feed-shared-ad',
        'div[data-ad-banner]',
        'aside .ad-banner',
        '.feed-shared-update-v2:has(.feed-shared-actor--promoted)',
        '.feed-shared-update-v2:has([data-tracking-control-name*="promoted" i])',
        '.feed-shared-update-v2:has([data-tracking-control-name*="sponsored" i])',
        '.feed-shared-update-v2:has([data-urn*="urn:li:sponsored" i])',
        '.feed-shared-update-v2:has([data-urn*="urn:li:ad" i])',
        '.feed-shared-update-v2[data-ad-banner]',
        '.feed-shared-update-v2[data-ad]',
        '.feed-shared-update-v2[data-sponsored-post="true"]',
      ],
      apply: (doc: Document) => {
        const markSponsored = () => {
          // Both classic updates and modern [role="listitem"]
          const updates = doc.querySelectorAll('.feed-shared-update-v2, div[data-view-name*="feed-item"], div[role="listitem"]');
          updates.forEach((update) => {
            // Check actor sub-description or any label indicating promoted/promocionado
            const text = (update.textContent || '').trim().toLowerCase();
            const hasPromotedSub = update.querySelector('.update-components-actor__sub-description, .feed-shared-actor__sub-description');
            const subText = hasPromotedSub ? (hasPromotedSub.textContent || '').trim().toLowerCase() : '';

            const isPromoted =
              subText.includes('promocionado') ||
              subText.includes('promoted') ||
              subText.includes('sponsored') ||
              subText.includes('patrocinado') ||
              // In modern layout: check for standalone "promocionado" text node in header
              Array.from(update.querySelectorAll('div, p, span')).some((el) => {
                const direct = (el.textContent || '').trim().toLowerCase();
                return direct === 'promocionado' || direct === 'promoted' || direct === 'sponsored' || direct === 'publicidad';
              });

            if (isPromoted) {
              (update as HTMLElement).style.setProperty('display', 'none', 'important');
              update.setAttribute('data-clearframe-sponsored', 'true');
            }
          });
        };

        markSponsored();

        return () => {
          const hidden = doc.querySelectorAll('[data-clearframe-sponsored="true"]');
          hidden.forEach((el) => {
            (el as HTMLElement).style.removeProperty('display');
            el.removeAttribute('data-clearframe-sponsored');
          });
        };
      },
    },
  ],
};
