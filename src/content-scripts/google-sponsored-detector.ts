export {};
// Google Search sponsored results highlighter (ported from external extension)

const log = (...args: any[]) => console.log('[Revoke][google-sponsored]', ...args);

const STYLE_ID = 'rev-google-ad-style';
const AD_CONTAINER_CLASS = 'rev-google-ad-container';

function cleanupOldStyles() {
  try {
    const oldStyles = document.querySelectorAll('#fc-sponsored-highlight-style, #fee-google-network-idle-hook');
    oldStyles.forEach((el) => el.remove());
  } catch {}
  try {
    const oldElements = document.querySelectorAll(
      '.fc-sponsored-block, .fc-sponsored-link, .fc-sponsored-label, .fc-ad-label, .fc-ad-link, .fc-ad-container',
    );
    oldElements.forEach((el) => {
      el.classList.remove(
        'fc-sponsored-block',
        'fc-sponsored-link',
        'fc-sponsored-label',
        'fc-ad-label',
        'fc-ad-link',
        'fc-ad-container',
      );
      const htmlEl = el as HTMLElement;
      htmlEl.style.outline = '';
      htmlEl.style.background = '';
      htmlEl.style.borderRadius = '';
      htmlEl.style.padding = '';
      htmlEl.style.color = '';
      htmlEl.style.boxShadow = '';
    });
  } catch {}
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  const cssText =
    '.rev-google-ad-container {' +
    'position: relative !important;' +
    'margin-bottom: 24px !important;' +
    'border: 1px solid #dfe1e5 !important;' +
    'border-radius: 8px !important;' +
    'overflow: hidden !important;' +
    '}' +
    '.rev-google-ad-container::before {' +
    'content: "AD";' +
    'position: absolute;' +
    'top: 0;' +
    'right: 0;' +
    'background: #fdb952;' +
    'color: white;' +
    'padding: 4px 10px;' +
    'border-bottom-left-radius: 8px;' +
    'border-top-right-radius: 8px;' +
    'font-size: 11px;' +
    'font-weight: 700;' +
    'letter-spacing: 0.5px;' +
    'z-index: 10;' +
    '}' +
    '.rev-revoke-badge {' +
    'position: absolute;' +
    'bottom: 12px;' +
    'right: 12px;' +
    'background: #fdb952;' +
    'color: #ffffff;' +
    'border: none;' +
    'border-radius: 3px;' +
    'padding: 6px 12px;' +
    'font-size: 12px;' +
    'font-weight: 800;' +
    'line-height: 1;' +
    'letter-spacing: 0.2px;' +
    'text-transform: lowercase;' +
    'z-index: 10;' +
    'display: inline-flex;' +
    'align-items: center;' +
    'justify-content: center;' +
    'box-shadow: 0 2px 6px rgba(0,0,0,0.18);' +
    '}' +
    '.rev-google-ad-content {' +
    'padding: 14px 16px !important;' +
    'opacity: 0.45 !important;' +
    'filter: grayscale(50%) !important;' +
    'position: relative !important;' +
    '}' +
    '.rev-google-sponsored-label {' +
    'display: inline-block !important;' +
    'padding: 3px 6px !important;' +
    'border: 2px solid #DC3545 !important;' +
    'border-radius: 4px !important;' +
    'color: inherit !important;' +
    'font-size: 14px !important;' +
    'font-weight: 500 !important;' +
    'margin-bottom: 8px !important;' +
    'background: rgba(220, 53, 69, 0.05) !important;' +
    '}';
  s.textContent = cssText;
  (document.head || document.documentElement).appendChild(s);
}

function highlightSponsoredElements() {
  cleanupOldStyles();
  ensureStyles();

  // Ads in Google Search pages (desktop) typically have data-text-ad="1" on the container
  const adContainers = document.querySelectorAll('[data-text-ad="1"]');
  for (let i = 0; i < adContainers.length; i++) {
    const container = adContainers[i];
    const containerEl = container as HTMLElement;
    if (containerEl.classList.contains(AD_CONTAINER_CLASS)) continue;
    containerEl.classList.add(AD_CONTAINER_CLASS);

    // badge
    const revokeBadge = document.createElement('div');
    revokeBadge.className = 'rev-revoke-badge';
    revokeBadge.textContent = 'revoke';
    containerEl.appendChild(revokeBadge);

    // main content area varies; in your snippet it used .vdQmEd
    const adContentArea = container.querySelector('.vdQmEd');
    if (adContentArea) {
      const areaEl = adContentArea as HTMLElement;
      areaEl.classList.add('rev-google-ad-content');
      const sponsoredLabel = areaEl.querySelector('span.U3A9Ac.qV8iec');
      if (sponsoredLabel) {
        sponsoredLabel.classList.add('rev-google-sponsored-label');
      }
    }
  }
}

let scanTimeout: ReturnType<typeof setTimeout> | null = null;
function debouncedHighlight() {
  if (scanTimeout) clearTimeout(scanTimeout);
  scanTimeout = setTimeout(() => highlightSponsoredElements(), 100);
}

function init() {
  // Limit to Google Search pages like https://www.google.com/search?q=...
  if (!/\.google\./.test(location.hostname) || !/\/?search/.test(location.pathname + location.search)) return;
  log('content script active on', location.href);
  highlightSponsoredElements();
  const mo = new MutationObserver((mutations) => {
    let shouldRescan = false;
    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];
      const added = mutation.addedNodes;
      for (let j = 0; j < added.length; j++) {
        const node = added[j];
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (
            element.classList?.contains(AD_CONTAINER_CLASS) ||
            element.classList?.contains('rev-revoke-badge') ||
            element.classList?.contains('rev-google-ad-content')
          ) {
            continue;
          }
          shouldRescan = true;
          break;
        }
      }
      if (shouldRescan) break;
    }
    if (shouldRescan) debouncedHighlight();
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
}

// Check feature flag before initializing
chrome.storage.local.get(['feature_google_ad_warn_enabled'], (result) => {
  const enabled = result.feature_google_ad_warn_enabled ?? true;
  if (enabled) {
    try {
      init();
    } catch {}
  }
});
