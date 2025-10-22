// Lightweight content script to render an Ethos Network score ring around
// profile avatars on X/Twitter. The actual color ranges can be tuned later.

type Nullable<T> = T | null | undefined;

type EthosUserLike = {
  score?: number;
  networkScore?: number;
  ethosScore?: number;
};

const ETHOS_API_BASES = [
  // These may change; we try several common forms so implementation works once the right one is confirmed.
  'https://api.ethos.network/api/v2',
  'https://api.ethos.network/v2',
];

const CLIENT_HEADER_VALUE = 'revoke-cash-extension';

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

const inFlight = new Map<string, Promise<number | null>>();

// --- Lightweight batching (tRPC bulk endpoint) ---
const BATCH_MAX = 25;
const BATCH_DELAY_MS = 250;
const batchQueue = new Set<string>(); // handles
const batchWaiters = new Map<string, Array<(v: number | null) => void>>();
let batchTimer: number | null = null;

function enqueueForBatch(handle: string): Promise<number | null> {
  return new Promise((resolve) => {
    const waiters = batchWaiters.get(handle) ?? [];
    waiters.push(resolve);
    batchWaiters.set(handle, waiters);
    batchQueue.add(handle);
    scheduleBatch();
  });
}

function scheduleBatch(): void {
  if (batchTimer !== null) return;
  batchTimer = setTimeout(async () => {
    batchTimer = null;
    const handles: string[] = [];
    for (const h of batchQueue) {
      handles.push(h);
      if (handles.length >= BATCH_MAX) break;
    }
    handles.forEach((h) => batchQueue.delete(h));
    if (handles.length === 0) return;

    const result = await fetchScoresBulk(handles);
    // Resolve all waiters
    handles.forEach((h) => {
      const val = result.get(h) ?? null;
      const resolvers = batchWaiters.get(h) ?? [];
      batchWaiters.delete(h);
      resolvers.forEach((fn) => fn(val));
    });
  }, BATCH_DELAY_MS) as unknown as number;
}

async function fetchScoresBulk(handles: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (handles.length === 0) return map;

  const userkeys = handles.map((h) => `service:x.com:username:${h}`);
  const inputObj = { '0': { json: { userkeys } } } as const;
  const inputParam = encodeURIComponent(JSON.stringify(inputObj));
  const url = `${ETHOS_API_BASES[0]}/trpc/score.bulkByUserKeys?batch=1&input=${inputParam}`;

  try {
    const res = await fetch(url, {
      headers: {
        accept: 'application/json, text/plain, */*',
        'X-Ethos-Client': CLIENT_HEADER_VALUE,
      },
      credentials: 'omit',
      mode: 'cors',
    });
    if (!res.ok) return map;
    const data = await res.json();
    // Expecting an array with one entry for the batched call.
    const first = Array.isArray(data) ? data[0] : data;
    const json = first?.result?.data?.json ?? first?.result?.data ?? first?.json ?? first;

    // Attempt to find a mapping from userkey -> score.
    // Heuristic: search recursively for numbers keyed by the exact userkeys, or objects containing { userkey, score }.
    const found = new Map<string, number>();

    function scan(obj: unknown): void {
      if (!obj) return;
      if (Array.isArray(obj)) {
        obj.forEach((el) => scan(el));
        return;
      }
      if (typeof obj !== 'object') return;
      const o = obj as Record<string, unknown>;

      // Pattern: { [userkey]: number } OR { [userkey]: { score: number, ... } }
      for (const k of Object.keys(o)) {
        const v = (o as Record<string, unknown>)[k];
        if (userkeys.includes(k)) {
          if (typeof v === 'number') {
            const handle = k.split(':').pop()!;
            found.set(handle, v);
          } else if (v && typeof v === 'object') {
            const s = (v as Record<string, unknown>)['score'];
            if (typeof s === 'number') {
              const handle = k.split(':').pop()!;
              found.set(handle, s);
            }
          }
        }
      }

      // Pattern: { ... any nested arrays/objects ... }
      for (const v of Object.values(o)) {
        if (v && typeof v === 'object') {
          // Pattern: { userkey: 'service:x.com:username:foo', score: 123 }
          const uk = (v as Record<string, unknown>)['userkey'];
          const sc =
            (v as Record<string, unknown>)['score'] ??
            (v as Record<string, unknown>)['networkScore'] ??
            (v as Record<string, unknown>)['ethosScore'];
          if (typeof uk === 'string' && typeof sc === 'number' && userkeys.includes(uk)) {
            const handle = uk.split(':').pop()!;
            found.set(handle, sc);
          }
          scan(v);
        }
      }
    }

    scan(json);

    // Populate cache and return
    for (const [h, s] of found) {
      writeCache(h, s);
      map.set(h, s);
    }
  } catch {
    // ignore
  }

  return map;
}

function getNow(): number {
  return Date.now();
}

function cacheKey(handle: string): string {
  return `ethosScore:${handle.toLowerCase()}`;
}

function readCache(handle: string): number | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(handle));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { v: number; t: number };
    if (getNow() - parsed.t > CACHE_TTL_MS) return null;
    return parsed.v;
  } catch {
    return null;
  }
}

function writeCache(handle: string, score: number): void {
  try {
    sessionStorage.setItem(cacheKey(handle), JSON.stringify({ v: score, t: getNow() }));
  } catch {
    // ignore storage errors
  }
}

function parseScore(obj: Nullable<EthosUserLike>): number | null {
  if (!obj) return null;
  const candidates = [obj.networkScore, obj.ethosScore, obj.score].filter(
    (v): v is number => typeof v === 'number' && !Number.isNaN(v),
  );
  if (candidates.length > 0) return candidates[0]!;
  return null;
}

async function tryFetch(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, {
      headers: {
        accept: 'application/json',
        'X-Ethos-Client': CLIENT_HEADER_VALUE,
      },
      credentials: 'omit',
      mode: 'cors',
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Try common response shapes; keep flexible.
    // { user: { networkScore } } | { data: { score } } | { networkScore }
    const maybeUser = (data?.user ?? data?.data ?? data) as EthosUserLike;
    return parseScore(maybeUser);
  } catch {
    return null;
  }
}

async function fetchEthosScore(handle: string): Promise<number | null> {
  const cached = readCache(handle);
  if (cached !== null) return cached;

  if (inFlight.has(handle)) return inFlight.get(handle)!;

  const p = (async () => {
    // First, try to piggyback on our batching pipeline to minimize requests.
    const batched = await enqueueForBatch(handle);
    if (typeof batched === 'number') return batched;

    // Fallback attempts (older endpoints); kept for resilience if needed.
    const userKey = `service:x.com:username:${handle}`;
    const candidatePaths = [
      `/users/by/userkey/${encodeURIComponent(userKey)}`,
      `/user/by/userkey/${encodeURIComponent(userKey)}`,
      `/users/by/twitter/${encodeURIComponent(handle)}`,
      `/user/by/twitter/${encodeURIComponent(handle)}`,
    ];

    for (const base of ETHOS_API_BASES) {
      for (const path of candidatePaths) {
        const s = await tryFetch(`${base}${path}`);
        if (typeof s === 'number') {
          writeCache(handle, s);
          return s;
        }
      }
    }

    return null;
  })();

  inFlight.set(handle, p);
  const result = await p;
  inFlight.delete(handle);
  return result;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function colorForScore(score: number): { ring: string; pillBg: string; pillFg: string } {
  // Ethos credibility score ranges (0-2800)
  if (score >= 2000) {
    // Exemplary: 2000-2800 (dark green)
    return { ring: '#16a34a', pillBg: '#16a34a', pillFg: '#ffffff' };
  }
  if (score >= 1600) {
    // Reputable: 1600-1999 (blue)
    return { ring: '#2596be', pillBg: '#2596be', pillFg: '#ffffff' };
  }
  if (score >= 1200) {
    // Neutral: 1200-1599 (gray)
    return { ring: '#6b7280', pillBg: '#6b7280', pillFg: '#ffffff' };
  }
  if (score >= 800) {
    // Questionable: 800-1199 (gold)
    return { ring: '#eab308', pillBg: '#eab308', pillFg: '#0b1221' };
  }
  // Untrusted: 0-799 (red)
  return { ring: '#dc2626', pillBg: '#dc2626', pillFg: '#ffffff' };
}

function isValidHandle(candidate: string): boolean {
  return /^@[A-Za-z0-9_]{1,15}$/.test(candidate) || /^[A-Za-z0-9_]{1,15}$/.test(candidate);
}

function sanitizeHandle(raw: string): string | null {
  let h = raw.trim();
  if (h.startsWith('@')) h = h.slice(1);
  if (!isValidHandle(h)) return null;
  return h;
}

function extractHandleFromContainer(container: Element): string | null {
  // Prefer handle from data-testid like "UserAvatar-Container-<handle>"
  const testid = container.getAttribute('data-testid');
  if (testid && testid.startsWith('UserAvatar-Container-')) {
    const raw = testid.replace('UserAvatar-Container-', '');
    const h = sanitizeHandle(raw);
    if (h) return h;
  }

  // Check for DM conversation avatar
  const dmAvatar = container.querySelector('[data-testid="DM_Conversation_Avatar"]');
  if (dmAvatar) {
    // For DMs, look for the username/handle text in the conversation row
    // Walk up to find the conversation container
    let parent: Element | null = container;
    let depth = 0;
    while (parent && depth < 10) {
      // Look for username text - DM conversations show "@username" or "displayname @username"
      const textContent = parent.textContent || '';
      // Extract @username patterns from the text
      const handleMatch = textContent.match(/@([A-Za-z0-9_]{1,15})/);
      if (handleMatch && handleMatch[1]) {
        const h = sanitizeHandle(handleMatch[1]);
        if (h) return h;
      }

      // Also try looking for the conversation link and extract from its aria-label
      const convLink = parent.querySelector('[data-testid="DM_Conversation_Avatar"]') as HTMLElement;
      if (convLink) {
        const ariaLabel = convLink.getAttribute('aria-label');
        if (ariaLabel) {
          // aria-label might contain "Conversation with @username"
          const labelMatch = ariaLabel.match(/@([A-Za-z0-9_]{1,15})/);
          if (labelMatch && labelMatch[1]) {
            const h = sanitizeHandle(labelMatch[1]);
            if (h) return h;
          }
        }
      }

      parent = parent.parentElement;
      depth++;
    }
    // If no handle found, skip this DM avatar (might be a group chat)
    return null;
  }

  // Fallback: look for the closest anchor link with a single-segment pathname
  const a = container.querySelector('a[href^="/"]');
  if (a) {
    try {
      const url = new URL((a as HTMLAnchorElement).href, location.origin);
      const path = url.pathname;
      const seg = path.split('/').filter(Boolean)[0];
      if (seg) {
        const h = sanitizeHandle(seg);
        if (h) return h;
      }
    } catch {
      // ignore
    }
  }

  return null;
}

function isSquareAvatar(container: HTMLElement): boolean {
  // 1) Look for children with aria-label "Square profile picture"
  if (container.querySelector('[aria-label="Square profile picture"]')) {
    return true;
  }

  // 2) Look for clip-path styles containing "shape-square"
  // Check all descendants for inline styles with shape-square
  const allDescendants = container.querySelectorAll('*');
  for (const el of Array.from(allDescendants)) {
    const style = (el as HTMLElement).getAttribute('style');
    if (style && style.includes('shape-square')) {
      return true;
    }
  }

  return false;
}

function ensureRing(container: HTMLElement, score: number, handle: string): void {
  if (container.getAttribute('data-ethos-ring') === '1') return;

  const styles = getComputedStyle(container);
  if (styles.position === 'static') {
    container.style.position = 'relative';
  }
  // Ensure overflow is visible so our absolutely positioned elements can extend beyond
  if (styles.overflow !== 'visible') {
    container.style.overflow = 'visible';
  }

  const { ring, pillBg, pillFg } = colorForScore(score);

  // Detect if this is a large profile page avatar (typically >120px)
  const containerSize = Math.min(container.clientWidth, container.clientHeight);
  const isLargeProfileAvatar = containerSize > 120;

  const borderSize = Math.max(3, Math.floor(containerSize * 0.07));

  const overlay = document.createElement('div');
  overlay.setAttribute('data-ethos-ring-overlay', '');
  overlay.style.position = 'absolute';
  overlay.style.top = `-${borderSize}px`;
  overlay.style.left = `-${borderSize}px`;
  overlay.style.right = `-${borderSize}px`;
  overlay.style.bottom = `-${borderSize}px`;
  overlay.style.border = `${borderSize}px solid ${ring}`;
  // Detect square avatars (Twitter sometimes uses square logos with rounded corners)
  const isSquare = isSquareAvatar(container);
  if (isSquare) {
    // For square avatars, use a rounded rectangle instead of a circle
    const radius = Math.max(8, Math.round(container.clientWidth * 0.2));
    overlay.style.borderRadius = `${radius}px`;
  } else {
    overlay.style.borderRadius = '9999px';
  }
  overlay.style.pointerEvents = 'none';
  overlay.style.boxSizing = 'border-box';
  overlay.style.zIndex = '2';

  container.appendChild(overlay);

  // Score pill (clickable link to Ethos profile)
  const pill = document.createElement('a');
  pill.setAttribute('data-ethos-ring-pill', '');
  pill.href = `https://app.ethos.network/profile/x/${handle}`;
  pill.target = '_blank';
  pill.rel = 'noopener noreferrer';
  pill.style.position = 'absolute';
  pill.style.left = '50%';
  pill.style.transform = 'translateX(-50%)';
  pill.style.background = pillBg;
  pill.style.color = pillFg;
  pill.style.fontWeight = '700';
  pill.style.borderRadius = '9999px';
  pill.style.border = '1px transparent solid';
  pill.style.zIndex = '999999';
  pill.style.pointerEvents = 'auto';
  pill.style.display = 'flex';
  pill.style.alignItems = 'center';
  pill.style.textDecoration = 'none';
  pill.style.cursor = 'pointer';

  // For large profile avatars: bigger pill, overlapping the bottom
  if (isLargeProfileAvatar) {
    pill.style.bottom = '-2px'; // Slightly below the avatar border
    pill.style.fontSize = '14px';
    pill.style.lineHeight = '20px';
    pill.style.padding = '4px 12px 4px 14px';
    pill.style.gap = '6px';
  } else {
    // Regular small avatars: pill below avatar
    const pillDrop = Math.ceil(borderSize * 3 + Math.max(6, containerSize * 0.08));
    pill.style.bottom = `-${pillDrop}px`;
    pill.style.fontSize = '10px';
    pill.style.lineHeight = '14px';
    pill.style.padding = '1px 6px 1px 8px';
    pill.style.gap = '3px';
  }

  // Add Ethos logo SVG
  const logoSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const svgSize = isLargeProfileAvatar ? '16' : '11';
  logoSvg.setAttribute('width', svgSize);
  logoSvg.setAttribute('height', svgSize);
  logoSvg.setAttribute('viewBox', '0 0 13 12');
  logoSvg.setAttribute('fill', 'none');
  logoSvg.style.flexShrink = '0';

  const logoPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  logoPath.setAttribute('fill-rule', 'evenodd');
  logoPath.setAttribute('clip-rule', 'evenodd');
  logoPath.setAttribute(
    'd',
    'M4.93206 1.50016L4.93219 1.50016C5.35845 2.04334 5.70918 2.64863 5.96852 3.30021H2.00012L2.00012 3.29981H2L2.00009 8.7001H4.89566V8.70032H5.96164C5.70028 9.35208 5.3474 9.95727 4.9189 10.5H11V8.70032H5.96164C6.18946 8.13218 6.34775 7.52866 6.42598 6.90029H11V5.10024H6.4281C6.35142 4.47202 6.19472 3.86851 5.96852 3.30021H11V1.50016H4.93219L4.93206 1.5V1.50016ZM6.4281 5.10024C6.46376 5.39238 6.48212 5.68987 6.48212 5.99164C6.48212 6.29936 6.46303 6.60261 6.42598 6.90029H2.00012V5.10024H6.4281Z',
  );
  logoPath.setAttribute('fill', pillFg);
  logoSvg.appendChild(logoPath);

  // Add score text
  const scoreText = document.createElement('span');
  scoreText.textContent = String(clamp(Math.round(score), 0, 9999));

  pill.appendChild(scoreText);
  pill.appendChild(logoSvg);

  container.appendChild(pill);

  // Only add margin for small avatars
  if (!isLargeProfileAvatar) {
    container.style.marginBottom = '12px';
  }

  container.setAttribute('data-ethos-ring', '1');
}

function findAvatarContainers(root: ParentNode): HTMLElement[] {
  // Find both regular avatars and DM avatars
  const results: HTMLElement[] = [];

  // 1) Regular timeline/profile avatars
  const inners = Array.from(root.querySelectorAll('[data-testid^="UserAvatar-Container-"]')) as HTMLElement[];
  for (const el of inners) {
    // Ensure we only process the innermost container (avoid selecting parents)
    const closest = el.closest('[data-testid^="UserAvatar-Container-"]');
    if (closest === el) results.push(el);
  }

  // 2) DM conversation avatars (in messages sidebar)
  const dmAvatars = Array.from(root.querySelectorAll('[data-testid="DM_Conversation_Avatar"]')) as HTMLElement[];
  for (const dmAvatar of dmAvatars) {
    // Look for UserAvatar-Container inside the DM avatar structure
    const innerAvatar = dmAvatar.querySelector('[data-testid^="UserAvatar-Container-"]') as HTMLElement;
    if (innerAvatar && !results.includes(innerAvatar)) {
      results.push(innerAvatar);
    }
  }

  return results;
}

function isLiveSpaceAvatar(container: HTMLElement): boolean {
  // Skip avatars in "Live on X" sections entirely
  // Strategy: Look for "Live on X" heading as an ancestor marker

  // 1) Check if we're inside a pill-contents-container (the main live space UI)
  if (container.closest('[data-testid="pill-contents-container"]')) {
    return true;
  }

  // 2) Check if this avatar is very small (18px or smaller) - common in live space headers
  const size = Math.min(container.clientWidth, container.clientHeight);
  if (size <= 18) return true;

  // 3) Check if we're in a section with "Live on X" heading nearby
  // Walk up the DOM to find a containing section, then look for the "Live on X" text
  let ancestor: HTMLElement | null = container.parentElement;
  let depth = 0;
  while (ancestor && depth < 15) {
    // Look for text content containing "Live on X" within this ancestor
    const text = ancestor.textContent || '';
    if (text.includes('Live on X')) {
      // Found "Live on X" section, skip this avatar
      return true;
    }
    ancestor = ancestor.parentElement;
    depth++;
  }

  return false;
}

function isQuoteTweetAvatar(container: HTMLElement): boolean {
  // Quote tweet avatars are typically 20-28px and inside an element with role="link" and tabindex="0"
  // They're also inside a quoted tweet card structure

  // 1) Check size - quote tweet avatars are typically 24px or smaller
  const size = Math.min(container.clientWidth, container.clientHeight);
  if (size > 28) return false;

  // 2) Look for the quote tweet container with role="link" and tabindex="0"
  // Quote tweets have a wrapping link with these attributes
  const quoteTweetLink = container.closest('[role="link"][tabindex="0"]');
  if (!quoteTweetLink) return false;

  // 3) Additional check: quote tweets usually have tweetText testid inside
  const hasTweetText = quoteTweetLink.querySelector('[data-testid="tweetText"]');
  if (!hasTweetText) return false;

  return true;
}

async function processAvatar(container: HTMLElement): Promise<void> {
  if (container.getAttribute('data-ethos-ring') === '1') return;

  // Skip avatars in "Live on X" sections (overlapping pill avatars)
  if (isLiveSpaceAvatar(container)) return;

  // Skip quote tweet avatars entirely
  if (isQuoteTweetAvatar(container)) return;

  const handle = extractHandleFromContainer(container);
  if (!handle) return;

  const score = await fetchEthosScore(handle);

  if (typeof score === 'number' && score > 0) {
    ensureRing(container, score, handle);
  }
}

function scan(): void {
  const avatars = findAvatarContainers(document);
  console.log('[Ethos] Scan found', avatars.length, 'avatars');
  avatars.forEach((el) => {
    // Defer slightly to avoid jank during heavy DOM updates
    void processAvatar(el);
  });
}

function scanProfilePage(): void {
  // Extract username from URL like twitter.com/username or x.com/username
  const pathMatch = location.pathname.match(/^\/([A-Za-z0-9_]{1,15})(?:\/|$)/);
  if (!pathMatch) {
    console.log('[Ethos Profile] No username in URL:', location.pathname);
    return;
  }

  const username = pathMatch[1];

  // Skip if it's a Twitter route (not a profile)
  const twitterRoutes = [
    'home',
    'explore',
    'notifications',
    'messages',
    'bookmarks',
    'lists',
    'communities',
    'premium',
    'verified',
    'settings',
    'compose',
    'i',
    'search',
  ];
  if (twitterRoutes.includes(username.toLowerCase())) {
    console.log('[Ethos Profile] Skipping Twitter route:', username);
    return;
  }

  console.log('[Ethos Profile] Pre-fetching score for:', username);

  // Pre-fetch the score for this user
  void fetchEthosScore(username).then((score) => {
    console.log('[Ethos Profile] Score fetched:', score, 'for', username);
    // The regular scan will pick up the avatar and use the cached score
    scan();
  });
}

function setupObserver(): void {
  const obs = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList') {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof Element)) return;
          const candidates = findAvatarContainers(n);
          if (candidates.length > 0) {
            console.log('[Ethos] MutationObserver found', candidates.length, 'new avatars');
          }
          candidates.forEach((el) => void processAvatar(el));
        });
      }
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
  console.log('[Ethos] MutationObserver setup complete');
}

function init(): void {
  if (location.hostname !== 'twitter.com' && location.hostname !== 'x.com') return;
  // Check if we're on a profile page and pre-fetch
  scanProfilePage();
  // Initial pass
  scan();
  // Observe dynamic content
  setupObserver();
  // Watch for URL changes (Twitter is an SPA)
  setupNavigationObserver();
}

function setupNavigationObserver(): void {
  let lastUrl = location.href;

  // Monitor URL changes via History API
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    handleUrlChange();
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    handleUrlChange();
  };

  window.addEventListener('popstate', handleUrlChange);

  function handleUrlChange() {
    if (location.href !== lastUrl) {
      console.log('[Ethos] URL changed from', lastUrl, 'to', location.href);
      lastUrl = location.href;
      // Pre-fetch profile score immediately
      scanProfilePage();
      // Scan multiple times with increasing delays to catch content as it loads
      setTimeout(() => scan(), 300);
      setTimeout(() => scan(), 800);
      setTimeout(() => scan(), 1500);
      setTimeout(() => scan(), 2500);
    }
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
