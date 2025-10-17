export {};
// CoinGecko ad highlighter

const log = (...args: any[]) => console.log('[Revoke][coingecko-ads]', ...args);

const STYLE_ID = 'rev-coingecko-ad-style';
const PROCESSED_CLASS = 'rev-coingecko-processed';
const AD_CONTAINER_CLASS = 'rev-coingecko-ad-container';

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  const cssText = `
    .rev-coingecko-ad-container {
      position: relative !important;
      border: 3px solid rgb(255, 38, 60) !important;
      border-radius: 8px !important;
      box-shadow: 0 0 10px rgba(255, 38, 60, 0.3) !important;
      overflow: hidden !important;
      opacity: 0.45 !important;
      filter: grayscale(50%) !important;
    }
    .rev-coingecko-ad-container::before {
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
    .rev-coingecko-revoke-badge {
      position: absolute !important;
      top: 0 !important;
      right: 45px !important;
      background: #fdb952 !important;
      color: #ffffff !important;
      border: none !important;
      border-bottom-left-radius: 8px !important;
      border-bottom-right-radius: 8px !important;
      padding: 4px 10px !important;
      font-size: 11px !important;
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
  if (container.querySelector('.rev-coingecko-revoke-badge')) return;

  const badge = document.createElement('div');
  badge.className = 'rev-coingecko-revoke-badge';
  badge.textContent = 'revoke';
  (container as HTMLElement).appendChild(badge);
}

function highlightAds() {
  // Strategy 1: Find ads by data-ads-target="banner" attribute
  const bannerAds = document.querySelectorAll('[data-ads-target="banner"]');

  for (let i = 0; i < bannerAds.length; i++) {
    const banner = bannerAds[i];
    if (banner.classList.contains(PROCESSED_CLASS)) continue;

    banner.classList.add(PROCESSED_CLASS);
    banner.classList.add(AD_CONTAINER_CLASS);
    addRevokeBadge(banner);
    log('Highlighted banner ad (data-ads-target) on', location.href);
  }

  // Strategy 2: Find ads by data-aaad="true" attribute
  const aaadAds = document.querySelectorAll('[data-aaad="true"]');

  for (let i = 0; i < aaadAds.length; i++) {
    const ad = aaadAds[i];
    if (ad.classList.contains(PROCESSED_CLASS)) continue;

    // Find the parent container that wraps the ad
    let adContainer = ad;
    let parentElement = ad.parentElement;
    let attempts = 0;

    while (parentElement && attempts < 10) {
      // Look for the data-ads-target parent or a suitable container
      if (parentElement.hasAttribute('data-ads-target')) {
        adContainer = parentElement;
        break;
      }
      parentElement = parentElement.parentElement;
      attempts++;
    }

    adContainer.classList.add(PROCESSED_CLASS);
    adContainer.classList.add(AD_CONTAINER_CLASS);
    addRevokeBadge(adContainer);
    log('Highlighted ad (data-aaad) on', location.href);
  }

  // Strategy 3: Find Google ad iframes
  const googleAdIframes = document.querySelectorAll(
    'iframe[id*="google_ads_iframe"], iframe[src*="googlesyndication"], iframe[src*="safeframe"]',
  );

  for (let i = 0; i < googleAdIframes.length; i++) {
    const iframe = googleAdIframes[i];
    let parentElement = iframe.parentElement;
    let attempts = 0;
    let adContainer: HTMLElement | null = null;

    while (parentElement && attempts < 15) {
      // Look for a suitable container (data-ads-target or a wrapper div)
      if (
        parentElement.hasAttribute('data-ads-target') ||
        parentElement.hasAttribute('data-aaad') ||
        (parentElement.className && parentElement.className.includes('container'))
      ) {
        adContainer = parentElement;
        break;
      }
      parentElement = parentElement.parentElement;
      attempts++;
    }

    if (adContainer && !adContainer.classList.contains(PROCESSED_CLASS)) {
      adContainer.classList.add(PROCESSED_CLASS);
      adContainer.classList.add(AD_CONTAINER_CLASS);
      addRevokeBadge(adContainer);
      log('Highlighted Google ad iframe on', location.href);
    }
  }

  // Strategy 4: Find ad units by CoinGecko-specific classes/patterns
  const coinGeckoAdUnits = document.querySelectorAll('[data-aa-adunit*="CoinGecko"]');

  for (let i = 0; i < coinGeckoAdUnits.length; i++) {
    const adUnit = coinGeckoAdUnits[i];
    if (adUnit.classList.contains(PROCESSED_CLASS)) continue;

    // Find suitable parent container
    let adContainer = adUnit;
    let parentElement = adUnit.parentElement;
    let attempts = 0;

    while (parentElement && attempts < 10) {
      if (parentElement.hasAttribute('data-ads-target')) {
        adContainer = parentElement;
        break;
      }
      parentElement = parentElement.parentElement;
      attempts++;
    }

    adContainer.classList.add(PROCESSED_CLASS);
    adContainer.classList.add(AD_CONTAINER_CLASS);
    addRevokeBadge(adContainer);
    log('Highlighted CoinGecko ad unit on', location.href);
  }

  // Strategy 5: Find sidebar and sticky ads
  const stickyAds = document.querySelectorAll(
    '[data-ads-target="sidebar"], [data-ads-target="sticky"], [data-ads-target="rail"]',
  );

  for (let i = 0; i < stickyAds.length; i++) {
    const ad = stickyAds[i];
    if (ad.classList.contains(PROCESSED_CLASS)) continue;

    ad.classList.add(PROCESSED_CLASS);
    ad.classList.add(AD_CONTAINER_CLASS);
    addRevokeBadge(ad);
    log('Highlighted sticky/sidebar ad on', location.href);
  }
}

let scanTimeout: ReturnType<typeof setTimeout> | null = null;
function debouncedHighlight() {
  if (scanTimeout) clearTimeout(scanTimeout);
  scanTimeout = setTimeout(() => {
    ensureStyles();
    highlightAds();
  }, 100);
}

function init() {
  // Limit to CoinGecko
  if (!location.hostname.includes('coingecko.com')) return;

  log('content script active on', location.href);
  ensureStyles();
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
          if (element.classList?.contains(PROCESSED_CLASS) || element.classList?.contains(AD_CONTAINER_CLASS)) {
            continue;
          }
          // Check if the added element or its children contain ad-related attributes
          if (
            element.hasAttribute('data-ads-target') ||
            element.hasAttribute('data-aaad') ||
            element.hasAttribute('data-aa-adunit') ||
            element.querySelector('[data-ads-target], [data-aaad], [data-aa-adunit]')
          ) {
            shouldRescan = true;
            break;
          }
        }
      }
      if (shouldRescan) break;
    }
    if (shouldRescan) debouncedHighlight();
  });

  mo.observe(document.documentElement, { childList: true, subtree: true });
}

try {
  init();
} catch (e) {
  log('Error initializing:', e);
}
