export {};
// DexScreener ad highlighter

const log = (...args: any[]) => console.log('[Revoke][dexscreener-ads]', ...args);

const STYLE_ID = 'rev-dexscreener-ad-style';
const PROCESSED_CLASS = 'rev-dexscreener-processed';
const AD_CONTAINER_CLASS = 'rev-dexscreener-ad-container';
const TOKEN_AD_PROCESSED_CLASS = 'rev-dexscreener-token-ad-processed';

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  const cssText = `
    .rev-dexscreener-ad-warning {
      color: rgb(255, 38, 60) !important;
      font-weight: 700 !important;
      font-size: 14px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.3px !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      max-width: 100% !important;
    }
    .rev-dexscreener-ad-container {
      position: relative !important;
      border: 3px solid rgb(255, 38, 60) !important;
      border-radius: 8px !important;
      box-shadow: 0 0 10px rgba(255, 38, 60, 0.3) !important;
      overflow: hidden !important;
      opacity: 0.45 !important;
      filter: grayscale(50%) !important;
    }
    .rev-dexscreener-ad-container::before {
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
    .rev-dexscreener-revoke-badge {
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
    .rev-dexscreener-token-ad-label {
      color: rgb(255, 38, 60) !important;
      font-weight: 700 !important;
    }
  `;
  s.textContent = cssText;
  (document.head || document.documentElement).appendChild(s);
}

function addRevokeBadge(container: Element) {
  // Check if badge already exists
  if (container.querySelector('.rev-dexscreener-revoke-badge')) return;

  const badge = document.createElement('div');
  badge.className = 'rev-dexscreener-revoke-badge';
  badge.textContent = 'revoke';
  (container as HTMLElement).appendChild(badge);
}

function highlightBannerAds() {
  // Find all chakra-stack elements that contain "Ad" text (banner ads on main page)
  const adContainers = document.querySelectorAll('.chakra-stack');

  for (let i = 0; i < adContainers.length; i++) {
    const container = adContainers[i];
    if (container.classList.contains(PROCESSED_CLASS)) continue;

    // Look for the "Ad" text element
    const adTextElement = container.querySelector('.chakra-text');
    if (adTextElement && adTextElement.textContent?.trim() === 'Ad') {
      // Mark as processed
      container.classList.add(PROCESSED_CLASS);

      // Replace the text content
      adTextElement.textContent = 'AD';

      // Add styling to the text
      const textEl = adTextElement as HTMLElement;
      textEl.classList.add('rev-dexscreener-ad-warning');

      // Find the main ad container and add red border
      // The structure is: custom-8atqhb > custom-79elbk > ... > chakra-stack (where we are)
      // We need to go up to find the outer container
      let parentElement = container.parentElement;
      let attempts = 0;
      while (parentElement && attempts < 10) {
        // Look for the main ad container - it should be a div with specific characteristics
        // The custom-8atqhb or custom-79elbk classes contain the whole ad
        const classes = parentElement.className;
        if (classes && (classes.includes('custom-8atqhb') || classes.includes('custom-79elbk'))) {
          parentElement.classList.add(AD_CONTAINER_CLASS);
          addRevokeBadge(parentElement);
          break;
        }
        parentElement = parentElement.parentElement;
        attempts++;
      }

      log('Replaced banner ad label on', location.href);
    }
  }
}

function highlightTokenAds() {
  // Strategy 1: Find token ads with "Ad" label (custom-ali80x container)
  const tokenAdContainers = document.querySelectorAll('[class*="custom-ali80x"], [class*="custom-j0pheo"]');

  for (let i = 0; i < tokenAdContainers.length; i++) {
    const container = tokenAdContainers[i];
    if (container.classList.contains(TOKEN_AD_PROCESSED_CLASS)) continue;

    // Look for the "Ad" label with class custom-1nqxh3t
    const adLabel = container.querySelector('.chakra-text[class*="custom-1nqxh3t"]');
    if (adLabel && adLabel.textContent?.trim() === 'Ad') {
      // Mark as processed
      container.classList.add(TOKEN_AD_PROCESSED_CLASS);

      // Add styling to make it bold and red
      const labelEl = adLabel as HTMLElement;
      labelEl.classList.add('rev-dexscreener-token-ad-label');

      // Find the outermost container and add red border
      let parentElement = container.parentElement;
      let attempts = 0;
      while (parentElement && attempts < 10) {
        const classes = parentElement.className;
        if (classes && (classes.includes('custom-ali80x') || classes.includes('custom-j0pheo'))) {
          parentElement.classList.add(AD_CONTAINER_CLASS);
          addRevokeBadge(parentElement);
          break;
        }
        parentElement = parentElement.parentElement;
        attempts++;
      }

      // Also add border to the container itself if it's the outer one
      if (container.className.includes('custom-ali80x')) {
        container.classList.add(AD_CONTAINER_CLASS);
        addRevokeBadge(container);
      }

      log('Highlighted token ad (with Ad label) on', location.href);
    }
  }

  // Strategy 2: Find iframe-based ads with "Hide ad" buttons
  const hideAdButtons = document.querySelectorAll('button.chakra-button');

  for (let i = 0; i < hideAdButtons.length; i++) {
    const button = hideAdButtons[i];
    if (button.textContent?.trim() === 'Hide ad') {
      // Find the parent container
      let parentElement = button.parentElement;
      let attempts = 0;
      let adContainer: HTMLElement | null = null;

      while (parentElement && attempts < 15) {
        const classes = parentElement.className;
        // Look for the outermost ad container
        if (
          classes &&
          (classes.includes('custom-htsnkk') || classes.includes('custom-o8mcsb') || classes.includes('custom-ali80x'))
        ) {
          adContainer = parentElement as HTMLElement;
        }
        parentElement = parentElement.parentElement;
        attempts++;
      }

      if (adContainer && !adContainer.classList.contains(TOKEN_AD_PROCESSED_CLASS)) {
        adContainer.classList.add(TOKEN_AD_PROCESSED_CLASS);
        adContainer.classList.add(AD_CONTAINER_CLASS);
        addRevokeBadge(adContainer);
        log('Highlighted iframe ad (with Hide ad button) on', location.href);
      }
    }
  }

  // Strategy 3: Find ads by detecting adform.net links or ad iframes
  const adLinks = document.querySelectorAll('a[href*="adform.net"]');

  for (let i = 0; i < adLinks.length; i++) {
    const link = adLinks[i];
    let parentElement = link.parentElement;
    let attempts = 0;
    let adContainer: HTMLElement | null = null;

    while (parentElement && attempts < 15) {
      const classes = parentElement.className;
      if (
        classes &&
        (classes.includes('custom-htsnkk') || classes.includes('custom-o8mcsb') || classes.includes('custom-ali80x'))
      ) {
        adContainer = parentElement as HTMLElement;
      }
      parentElement = parentElement.parentElement;
      attempts++;
    }

    if (adContainer && !adContainer.classList.contains(TOKEN_AD_PROCESSED_CLASS)) {
      adContainer.classList.add(TOKEN_AD_PROCESSED_CLASS);
      adContainer.classList.add(AD_CONTAINER_CLASS);
      addRevokeBadge(adContainer);
      log('Highlighted ad (detected by adform.net link) on', location.href);
    }
  }

  // Strategy 4: Find ads by iframe src containing ad content
  const adIframes = document.querySelectorAll('iframe[src*="finixio"], iframe[src*="ads"]');

  for (let i = 0; i < adIframes.length; i++) {
    const iframe = adIframes[i];
    let parentElement = iframe.parentElement;
    let attempts = 0;
    let adContainer: HTMLElement | null = null;

    while (parentElement && attempts < 15) {
      const classes = parentElement.className;
      if (
        classes &&
        (classes.includes('custom-htsnkk') || classes.includes('custom-o8mcsb') || classes.includes('custom-ali80x'))
      ) {
        adContainer = parentElement as HTMLElement;
      }
      parentElement = parentElement.parentElement;
      attempts++;
    }

    if (adContainer && !adContainer.classList.contains(TOKEN_AD_PROCESSED_CLASS)) {
      adContainer.classList.add(TOKEN_AD_PROCESSED_CLASS);
      adContainer.classList.add(AD_CONTAINER_CLASS);
      addRevokeBadge(adContainer);
      log('Highlighted ad (detected by iframe) on', location.href);
    }
  }
}

function highlightAds() {
  ensureStyles();
  highlightBannerAds();
  highlightTokenAds();
}

let scanTimeout: ReturnType<typeof setTimeout> | null = null;
function debouncedHighlight() {
  if (scanTimeout) clearTimeout(scanTimeout);
  scanTimeout = setTimeout(() => highlightAds(), 100);
}

function init() {
  // Limit to DexScreener
  if (!location.hostname.includes('dexscreener.com')) return;

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
            element.classList?.contains(TOKEN_AD_PROCESSED_CLASS)
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
chrome.storage.local.get(['feature_dexscreener_ad_warn_enabled'], (result) => {
  const enabled = result.feature_dexscreener_ad_warn_enabled ?? true;
  if (enabled) {
    try {
      init();
    } catch (e) {
      log('Error initializing:', e);
    }
  }
});
