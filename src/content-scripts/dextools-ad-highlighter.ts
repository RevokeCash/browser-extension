export {};
// DexTools ad highlighter

const log = (...args: any[]) => console.log('[Revoke][dextools-ads]', ...args);

const STYLE_ID = 'rev-dextools-ad-style';
const PROCESSED_CLASS = 'rev-dextools-processed';
const AD_CONTAINER_CLASS = 'rev-dextools-ad-container';
const BANNER_AD_CLASS = 'rev-dextools-banner-ad';

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  const cssText = `
    .rev-dextools-ad-container {
      position: relative !important;
      border: 3px solid rgb(255, 38, 60) !important;
      border-radius: 8px !important;
      box-shadow: 0 0 10px rgba(255, 38, 60, 0.3) !important;
      overflow: hidden !important;
      opacity: 0.7 !important;
      filter: grayscale(50%) !important;
    }
    .rev-dextools-ad-container::before {
      content: "AD";
      position: absolute;
      top: 0;
      right: 0;
      background: #fdb952;
      color: white;
      padding: 4px 10px;
      border-bottom-left-radius: 8px;
      border-top-right-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      z-index: 999999;
    }
    .rev-dextools-banner-ad {
      position: relative !important;
      border: 3px solid rgb(255, 38, 60) !important;
      box-shadow: 0 0 10px rgba(255, 38, 60, 0.3) !important;
      opacity: 0.7 !important;
      filter: grayscale(50%) !important;
      display: block !important;
      min-height: 90px !important;
    }
    .rev-dextools-banner-ad::before {
      content: "AD";
      position: absolute;
      top: 0;
      right: 0;
      background: #fdb952;
      color: white;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      z-index: 999999;
    }
    .rev-dextools-revoke-badge {
      position: absolute !important;
      /* Force bottom-right placement regardless of container rules */
      inset: auto !important;
      top: auto !important;
      left: auto !important;
      bottom: 0px !important;
      right: 0px !important;
      transform: none !important;
      align-self: auto !important;
      background: #fdb952 !important;
      color: #ffffff !important;
      border: none !important;
      border-radius: 3px !important;
      padding: 6px 12px !important;
      font-size: 12px !important;
      font-weight: 800 !important;
      line-height: 1 !important;
      letter-spacing: 0.2px !important;
      text-transform: lowercase !important;
      z-index: 999999 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: 0 2px 6px rgba(0,0,0,0.18) !important;
      pointer-events: none !important;
    }
  `;
  s.textContent = cssText;
  (document.head || document.documentElement).appendChild(s);
}

function addRevokeBadge(container: Element) {
  // Check if badge already exists
  if (container.querySelector('.rev-dextools-revoke-badge')) return;

  const badge = document.createElement('div');
  badge.className = 'rev-dextools-revoke-badge';
  badge.textContent = 'revoke';
  (container as HTMLElement).appendChild(badge);
}

function highlightHeaderBannerAds() {
  // Strategy 1: Find app-header-banner elements
  const headerBanners = document.querySelectorAll('app-header-banner');

  for (let i = 0; i < headerBanners.length; i++) {
    const banner = headerBanners[i];
    if (banner.classList.contains(PROCESSED_CLASS)) continue;

    // Check if it contains ad content
    const hasCoinzilla = banner.querySelector('.coinzilla-banner-container');
    const hasSevioAds = banner.querySelector('.sevioads');
    const hasAdIframe = banner.querySelector('iframe[src*="czilladx.com"]');

    if (hasCoinzilla || hasSevioAds || hasAdIframe) {
      banner.classList.add(PROCESSED_CLASS);
      banner.classList.add(BANNER_AD_CLASS);
      addRevokeBadge(banner);
      log('Highlighted header banner ad on', location.href);
    }
  }
}

function hasProcessedParent(element: Element): boolean {
  let parent = element.parentElement;
  while (parent) {
    if (
      parent.classList?.contains(PROCESSED_CLASS) ||
      parent.classList?.contains(BANNER_AD_CLASS) ||
      parent.classList?.contains(AD_CONTAINER_CLASS)
    ) {
      return true;
    }
    parent = parent.parentElement;
  }
  return false;
}

function highlightCoinzillaBannerAds() {
  // Strategy 2: Find coinzilla-banner-container elements directly
  const coinzillaContainers = document.querySelectorAll('.coinzilla-banner-container');

  for (let i = 0; i < coinzillaContainers.length; i++) {
    const container = coinzillaContainers[i];
    if (container.classList.contains(PROCESSED_CLASS)) continue;

    // Skip if parent is already processed (e.g., app-header-banner)
    if (hasProcessedParent(container)) continue;

    container.classList.add(PROCESSED_CLASS);
    container.classList.add(AD_CONTAINER_CLASS);
    addRevokeBadge(container);
    log('Highlighted Coinzilla banner ad on', location.href);
  }
}

function highlightSevioAds() {
  // Strategy 3: Find sevioads elements
  const sevioAds = document.querySelectorAll('.sevioads');

  for (let i = 0; i < sevioAds.length; i++) {
    const ad = sevioAds[i];
    if (ad.classList.contains(PROCESSED_CLASS)) continue;

    // Skip if parent is already processed
    if (hasProcessedParent(ad)) continue;

    ad.classList.add(PROCESSED_CLASS);
    ad.classList.add(AD_CONTAINER_CLASS);
    addRevokeBadge(ad);
    log('Highlighted SevioAds ad on', location.href);
  }
}

function highlightAdIframes() {
  // Strategy 4: Find ad iframes by src patterns
  const adIframes = document.querySelectorAll(
    'iframe[src*="czilladx.com"], iframe[src*="coinzilla"], iframe[src*="sevio"], iframe[src*="/serve/"], iframe[src*="adform"], iframe[src*="doubleclick"]',
  );

  for (let i = 0; i < adIframes.length; i++) {
    const iframe = adIframes[i];

    // Find the appropriate parent container to highlight
    let parentElement = iframe.parentElement;
    let attempts = 0;
    let adContainer: HTMLElement | null = null;

    while (parentElement && attempts < 15) {
      if (parentElement.classList.contains(PROCESSED_CLASS)) {
        // Already processed, skip
        break;
      }

      // Look for containers that are likely ad wrappers
      const tagName = parentElement.tagName.toLowerCase();
      const classes = parentElement.className;

      if (
        tagName === 'app-header-banner' ||
        (classes &&
          (classes.includes('coinzilla') ||
            classes.includes('sevioads') ||
            classes.includes('ad-container') ||
            classes.includes('banner-container')))
      ) {
        adContainer = parentElement;
        break;
      }

      // If we've gone up several levels and found a reasonable container, use it
      if (attempts >= 3 && parentElement.children.length === 1) {
        adContainer = parentElement;
        break;
      }

      parentElement = parentElement.parentElement;
      attempts++;
    }

    // If we found a container, mark it (but skip if a parent is already processed)
    if (adContainer && !adContainer.classList.contains(PROCESSED_CLASS) && !hasProcessedParent(adContainer)) {
      adContainer.classList.add(PROCESSED_CLASS);
      adContainer.classList.add(AD_CONTAINER_CLASS);
      addRevokeBadge(adContainer);
      log('Highlighted ad (detected by iframe) on', location.href);
    } else if (!adContainer && iframe.parentElement) {
      // Fallback: highlight the immediate parent (but skip if a parent is already processed)
      const parent = iframe.parentElement;
      if (!parent.classList.contains(PROCESSED_CLASS) && !hasProcessedParent(parent)) {
        parent.classList.add(PROCESSED_CLASS);
        parent.classList.add(AD_CONTAINER_CLASS);
        addRevokeBadge(parent);
        log('Highlighted ad iframe parent on', location.href);
      }
    }
  }
}

function highlightZoneBasedAds() {
  // Strategy 5: Find elements with data-zone attribute (common for ad networks)
  const zoneElements = document.querySelectorAll('[data-zone]');

  for (let i = 0; i < zoneElements.length; i++) {
    const element = zoneElements[i];
    if (element.classList.contains(PROCESSED_CLASS)) continue;

    // Skip if parent is already processed
    if (hasProcessedParent(element)) continue;

    element.classList.add(PROCESSED_CLASS);
    element.classList.add(AD_CONTAINER_CLASS);
    addRevokeBadge(element);
    log('Highlighted zone-based ad on', location.href);
  }
}

function highlightAds() {
  ensureStyles();
  highlightHeaderBannerAds();
  highlightCoinzillaBannerAds();
  highlightSevioAds();
  highlightAdIframes();
  highlightZoneBasedAds();
}

let scanTimeout: ReturnType<typeof setTimeout> | null = null;
function debouncedHighlight() {
  if (scanTimeout) clearTimeout(scanTimeout);
  scanTimeout = setTimeout(() => highlightAds(), 100);
}

function init() {
  // Limit to DexTools
  if (!location.hostname.includes('dextools.io')) return;

  log('content script active on', location.href);
  highlightAds();

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
            element.classList?.contains(PROCESSED_CLASS) ||
            element.classList?.contains(AD_CONTAINER_CLASS) ||
            element.classList?.contains(BANNER_AD_CLASS)
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
chrome.storage.local.get(['feature_dextools_ad_warn_enabled'], (result) => {
  const enabled = result.feature_dextools_ad_warn_enabled ?? true;
  if (enabled) {
    try {
      init();
    } catch (e) {
      log('Error initializing:', e);
    }
  }
});
