export {};
// Twitter/X Original Poster (OP) and Not Original Poster (NOP) detector

const log = (...args: any[]) => console.log('[Revoke][twitter-op]', ...args);

const STYLE_ID = 'rev-twitter-op-style';
const OP_BADGE_CLASS = 'rev-twitter-op-badge';
const NOP_BADGE_CLASS = 'rev-twitter-nop-badge';
const PROCESSED_USER_ATTR = 'data-rev-op-processed';

// Levenshtein distance for username similarity
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
  }

  return matrix[b.length][a.length];
}

function isSimilarUsername(username1: string, username2: string): boolean {
  const u1 = username1.toLowerCase().replace(/^@/, '').replace(/[_-]/g, '');
  const u2 = username2.toLowerCase().replace(/^@/, '').replace(/[_-]/g, '');

  if (u1 === u2) return false; // Exact match, not similar

  // Check if one contains the other
  if (u1.includes(u2) || u2.includes(u1)) return true;

  // Check for common substrings (at least 4 consecutive characters)
  const minSubstringLength = 4;
  for (let i = 0; i <= u1.length - minSubstringLength; i++) {
    const substring = u1.substring(i, i + minSubstringLength);
    if (u2.includes(substring)) return true;
  }

  // Check Levenshtein distance
  const distance = levenshteinDistance(u1, u2);
  const maxLength = Math.max(u1.length, u2.length);
  const minLength = Math.min(u1.length, u2.length);

  // More lenient threshold: allow up to 40% difference or 5 character difference (whichever is larger)
  const threshold = Math.max(5, Math.floor(maxLength * 0.4));
  if (distance <= threshold) return true;

  // Check character overlap ratio (how many characters are in common)
  const chars1 = new Set(u1.split(''));
  const chars2 = new Set(u2.split(''));
  const intersection = new Set([...chars1].filter((x) => chars2.has(x)));
  const union = new Set([...chars1, ...chars2]);
  const jaccardSimilarity = intersection.size / union.size;

  // If more than 60% of characters are shared, consider it similar
  if (jaccardSimilarity > 0.6 && minLength >= 5) return true;

  return false;
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .${OP_BADGE_CLASS} {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: #22c55e !important;
      color: #ffffff !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      padding: 2px 6px !important;
      border-radius: 4px !important;
      margin-left: 6px !important;
      letter-spacing: 0.5px !important;
      vertical-align: middle !important;
      line-height: 1 !important;
    }
    
    .${NOP_BADGE_CLASS} {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: #ef4444 !important;
      color: #ffffff !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      padding: 2px 6px !important;
      border-radius: 4px !important;
      margin-left: 6px !important;
      letter-spacing: 0.5px !important;
      vertical-align: middle !important;
      line-height: 1 !important;
    }
  `;

  (document.head || document.documentElement).appendChild(style);
}

function getOriginalPosterUsername(): string | null {
  // Extract username from URL pattern: /username/status/123456789
  const match = window.location.pathname.match(/^\/([^/]+)\/status\/\d+/);
  if (match && match[1]) {
    return match[1].toLowerCase();
  }
  return null;
}

function getUsernameFromElement(element: Element): string | null {
  // Try to find username from various attributes
  // 1. Check data-testid on avatar container
  const avatarContainer = element.querySelector('[data-testid^="UserAvatar-Container-"]');
  if (avatarContainer) {
    const testId = avatarContainer.getAttribute('data-testid');
    if (testId) {
      const match = testId.match(/UserAvatar-Container-(.+)/);
      if (match && match[1]) {
        return match[1].toLowerCase();
      }
    }
  }

  // 2. Check href attributes pointing to user profiles
  const userLinks = element.querySelectorAll('a[href^="/"]');
  for (const link of Array.from(userLinks)) {
    const href = link.getAttribute('href');
    if (href && !href.includes('/status/') && !href.includes('/photo/') && !href.includes('/video/')) {
      const match = href.match(/^\/([^/]+)$/);
      if (match && match[1]) {
        return match[1].toLowerCase();
      }
    }
  }

  // 3. Check username text (e.g., @username)
  const usernameElements = element.querySelectorAll('[dir="ltr"]');
  for (const el of Array.from(usernameElements)) {
    const text = el.textContent?.trim() || '';
    if (text.startsWith('@')) {
      return text.substring(1).toLowerCase();
    }
  }

  return null;
}

function addBadge(userNameContainer: Element, isOP: boolean) {
  // Check if already processed
  if (userNameContainer.hasAttribute(PROCESSED_USER_ATTR)) return;
  userNameContainer.setAttribute(PROCESSED_USER_ATTR, 'true');

  const badge = document.createElement('span');
  badge.className = isOP ? OP_BADGE_CLASS : NOP_BADGE_CLASS;
  badge.textContent = isOP ? 'OP' : 'NOP';

  // Find the best place to insert the badge
  // Look for the display name container
  const displayNameContainer = userNameContainer.querySelector('[class*="r-1awozwy"][class*="r-18u37iz"]');
  if (displayNameContainer) {
    displayNameContainer.appendChild(badge);
  } else {
    userNameContainer.appendChild(badge);
  }
}

function processUserElements() {
  const opUsername = getOriginalPosterUsername();
  if (!opUsername) {
    log('Not on a tweet detail page or could not extract OP username');
    return;
  }

  log('Original poster username:', opUsername);

  // Find all user name containers
  const userNameContainers = document.querySelectorAll('[data-testid="User-Name"]');

  for (const container of Array.from(userNameContainers)) {
    // Skip if already processed
    if (container.hasAttribute(PROCESSED_USER_ATTR)) continue;

    // Find the parent tweet/user container
    const userContainer = container.closest('[data-testid^="tweet"], [class*="css-175oi2r"]');
    if (!userContainer) continue;

    const username = getUsernameFromElement(userContainer as Element);
    if (!username) continue;

    log('Found user:', username);

    if (username === opUsername) {
      log('Adding OP badge to:', username);
      addBadge(container, true);
    } else if (isSimilarUsername(username, opUsername)) {
      log('Adding NOP badge to:', username, '(similar to OP)');
      addBadge(container, false);
    }
  }
}

let scanTimeout: ReturnType<typeof setTimeout> | null = null;
function debouncedProcess() {
  if (scanTimeout) clearTimeout(scanTimeout);
  scanTimeout = setTimeout(() => processUserElements(), 100);
}

function init() {
  // Check if we're on Twitter/X
  if (!/(twitter\.com|x\.com)/.test(location.hostname)) return;

  // Check if we're on a tweet detail page
  if (!/\/status\/\d+/.test(location.pathname)) {
    log('Not on a tweet detail page');
    return;
  }

  log('Content script active on', location.href);

  ensureStyles();
  processUserElements();

  // Watch for dynamically loaded content (e.g., loading more comments)
  const observer = new MutationObserver((mutations) => {
    let shouldRescan = false;

    for (const mutation of mutations) {
      for (const node of Array.from(mutation.addedNodes)) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;

          // Skip our own badge elements
          if (element.classList?.contains(OP_BADGE_CLASS) || element.classList?.contains(NOP_BADGE_CLASS)) {
            continue;
          }

          // Check if new user elements were added
          if (
            element.querySelector('[data-testid="User-Name"]') ||
            element.getAttribute('data-testid') === 'User-Name'
          ) {
            shouldRescan = true;
            break;
          }
        }
      }
      if (shouldRescan) break;
    }

    if (shouldRescan) {
      debouncedProcess();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Re-process on URL changes (SPA navigation)
  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (/\/status\/\d+/.test(location.pathname)) {
        log('URL changed to tweet detail page, re-processing');
        // Clear processed flags
        document.querySelectorAll(`[${PROCESSED_USER_ATTR}]`).forEach((el) => {
          el.removeAttribute(PROCESSED_USER_ATTR);
        });
        // Remove existing badges
        document.querySelectorAll(`.${OP_BADGE_CLASS}, .${NOP_BADGE_CLASS}`).forEach((el) => {
          el.remove();
        });
        processUserElements();
      }
    }
  }, 1000);
}

// Check feature flag before initializing
chrome.storage.local.get(['feature_x_op_detector_enabled'], (result) => {
  const enabled = result.feature_x_op_detector_enabled ?? true;
  if (enabled) {
    try {
      init();
    } catch (error) {
      log('Error initializing:', error);
    }
  }
});
