export {};

const log = (...args: any[]) => console.log('[Revoke][antiphish]', ...args);

try {
  console.log('[Revoke][antiphish] content script loaded:', location.hostname, location.href);
} catch {}

const FEATURE_KEY = 'feature_antiphish_enabled';

async function getAntiPhishEnabled(): Promise<boolean> {
  try {
    // Prefer Promise-based API when available
    const browserAny = (globalThis as any).browser;
    if (browserAny?.storage?.local?.get) {
      const res = await browserAny.storage.local.get(FEATURE_KEY);
      const v = res?.[FEATURE_KEY];
      return typeof v === 'boolean' ? v : true;
    }
  } catch {}
  try {
    // Callback-based chrome API wrapped in a Promise
    const enabled = await new Promise<boolean>((resolve) => {
      const c: any = (globalThis as any).chrome;
      if (!c?.storage?.local?.get) return resolve(true);
      try {
        c.storage.local.get([FEATURE_KEY], (res: any) => {
          try {
            const v = res?.[FEATURE_KEY];
            resolve(typeof v === 'boolean' ? v : true);
          } catch {
            resolve(true);
          }
        });
      } catch {
        resolve(true);
      }
    });
    return enabled;
  } catch {}
  return true;
}

const CHAINPATROL_API = 'https://app.chainpatrol.io/api/v2/asset/check';
// NOTE: Provided test key
const CHAINPATROL_KEY = 'cp_test_Ay1JDzdWmp6NejYaPPtRyukxArHvdRp7Lu6m9bUamHsp';

type ChainPatrolResponse = {
  status?: string;
  verdict?: string;
  reason?: string;
  category?: string;
  [key: string]: any;
};

const BYPASS_KEY_PREFIX = 'cp_bypass::';
const BYPASS_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Track recently visited malicious sites to avoid repeated redirects for a short window
const VISITED_KEY_PREFIX = 'cp_recent::';
const VISITED_TTL_MS = 1 * 1000 * 60 * 5; // 5 minutes

function getBypassKey(url: string) {
  try {
    const u = new URL(url);
    return `${BYPASS_KEY_PREFIX}${u.hostname}`;
  } catch {
    return `${BYPASS_KEY_PREFIX}${location.hostname}`;
  }
}

function isBypassed(url: string): boolean {
  try {
    const key = getBypassKey(url);
    if (sessionStorage.getItem(key) === '1') return true;
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    if (raw === '1') return true;
    try {
      const obj = JSON.parse(raw);
      if (obj && typeof obj.exp === 'number') {
        if (Date.now() < obj.exp) return true;
        localStorage.removeItem(key);
      }
    } catch {}
    return false;
  } catch {
    return false;
  }
}

type BypassMode = 'session' | 'persist';

function setBypassed(url: string, mode: BypassMode) {
  try {
    const key = getBypassKey(url);
    if (mode === 'session') {
      sessionStorage.setItem(key, '1');
    } else {
      const exp = Date.now() + BYPASS_TTL_MS;
      localStorage.setItem(key, JSON.stringify({ exp }));
    }
  } catch {}
}

function getVisitedKey(url: string) {
  try {
    const u = new URL(url);
    return `${VISITED_KEY_PREFIX}${u.hostname}`;
  } catch {
    return `${VISITED_KEY_PREFIX}${location.hostname}`;
  }
}

function isRecentlyVisited(url: string): boolean {
  try {
    const key = getVisitedKey(url);
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    try {
      const obj = JSON.parse(raw);
      if (obj && typeof obj.exp === 'number') {
        if (Date.now() < obj.exp) return true;
        localStorage.removeItem(key);
      }
    } catch {}
    return false;
  } catch {
    return false;
  }
}

function markRecentlyVisited(url: string) {
  try {
    const key = getVisitedKey(url);
    const exp = Date.now() + VISITED_TTL_MS;
    localStorage.setItem(key, JSON.stringify({ exp }));
  } catch {}
}

function extractStatus(res: ChainPatrolResponse): string | undefined {
  const s = res?.status || res?.verdict || (res as any)?.result?.status;
  return typeof s === 'string' ? s.toUpperCase() : undefined;
}

async function checkUrl(url: string): Promise<ChainPatrolResponse | null> {
  try {
    const r = await fetch(CHAINPATROL_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': CHAINPATROL_KEY,
      },
      body: JSON.stringify({ content: url }),
    });
    if (!r.ok) return null;
    const j = (await r.json()) as ChainPatrolResponse;
    return j;
  } catch (e) {
    log('check failed', e);
    return null;
  }
}

function extractOriginalFromMetaMaskWarning(u: string): string | null {
  try {
    const url = new URL(u);
    if (!/metamask\.github\.io$/.test(url.hostname)) return null;
    if (!/phishing-warning/.test(url.pathname)) return null;
    const hash = url.hash?.replace(/^#/, '') || '';
    const params = new URLSearchParams(hash);
    const hrefParam = params.get('href') || params.get('url') || params.get('link');
    if (hrefParam) return decodeURIComponent(hrefParam);
    return null;
  } catch {
    return null;
  }
}

function renderBlockOverlay(url: string, result: ChainPatrolResponse) {
  try {
    const existing = document.getElementById('cp-antiphish-overlay');
    if (existing) return;

    const status = extractStatus(result) || 'BLOCKED';
    const reason =
      result?.reason || result?.category || (result as any)?.explanation || 'Flagged as malicious by Revoke Pro';

    const root = document.createElement('div');
    root.id = 'cp-antiphish-overlay';
    root.setAttribute('role', 'alertdialog');
    root.setAttribute('aria-modal', 'true');
    root.style.position = 'fixed';
    root.style.inset = '0';
    root.style.zIndex = '2147483647';
    root.style.background = 'rgba(0,0,0,0.92)';
    root.style.backdropFilter = 'blur(1.5px)';
    root.style.display = 'flex';
    root.style.alignItems = 'center';
    root.style.justifyContent = 'center';
    root.style.fontFamily = '-apple-system, system-ui, Segoe UI, Roboto, Inter, Arial, sans-serif';

    const card = document.createElement('div');
    card.style.width = 'min(820px, 92vw)';
    card.style.maxHeight = '88vh';
    card.style.overflow = 'auto';
    card.style.borderRadius = '16px';
    card.style.boxShadow = '0 12px 40px rgba(0,0,0,0.45)';
    card.style.background = '#0f0f12';
    card.style.border = '1px solid #2a2a2e';
    card.style.color = '#fff';
    card.style.padding = '28px';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.gap = '14px';
    header.style.marginBottom = '16px';

    const icon = document.createElement('div');
    icon.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 3.5l9 16.5H3L12 3.5z" stroke="#ffb020" stroke-width="1.5" fill="#231a00"/>
  <rect x="11" y="9" width="2" height="6" rx="1" fill="#ffb020"/>
  <circle cx="12" cy="17.5" r="1" fill="#ffb020"/>
</svg>`;

    const title = document.createElement('div');
    title.id = 'cp-antiphish-title';
    title.textContent = 'This website might be harmful';
    title.style.fontWeight = '800';
    title.style.fontSize = '22px';
    title.style.lineHeight = '1.2';
    card.setAttribute('aria-labelledby', title.id);

    header.appendChild(icon);
    header.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.innerHTML = `<div style="font-size:14px; line-height:1.6; color:#d6d6d6">
      Flagged as <b style=\"color:#ffb020\">${status}</b>. Attackers may trick you into doing something dangerous.<br/>
      URL: <code id=\"cp-antiphish-url\" style=\"font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size:12px; background:#17171a; color:#e3e3e3; padding:2px 6px; border:1px solid #2a2a2e; border-radius:6px;\">${url}</code>
    </div>`;
    subtitle.style.marginBottom = '14px';

    // Add an inline copy icon next to the URL code element
    const urlCodeEl = subtitle.querySelector('#cp-antiphish-url') as HTMLElement | null;
    if (urlCodeEl) {
      const copyIconBtn = document.createElement('button');
      copyIconBtn.setAttribute('aria-label', 'Copy URL');
      copyIconBtn.title = 'Copy URL';
      copyIconBtn.style.marginLeft = '6px';
      copyIconBtn.style.display = 'inline-flex';
      copyIconBtn.style.verticalAlign = 'middle';
      copyIconBtn.style.alignItems = 'center';
      copyIconBtn.style.justifyContent = 'center';
      copyIconBtn.style.width = '22px';
      copyIconBtn.style.height = '22px';
      copyIconBtn.style.background = 'transparent';
      copyIconBtn.style.border = '1px solid #2a2a2e';
      copyIconBtn.style.borderRadius = '6px';
      copyIconBtn.style.cursor = 'pointer';
      copyIconBtn.setAttribute('data-focusable', 'true');
      const clipboardSvg = () => `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 4h8a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="#d6d6d6" stroke-width="1.5" />
          <path d="M9 2h6v2H9z" fill="#2a2a2e" stroke="#d6d6d6" stroke-width="1.5" />
        </svg>`;
      const checkSvg = () => `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 13l4 4L19 7" stroke="#7ddc7d" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        </svg>`;
      copyIconBtn.innerHTML = clipboardSvg();
      copyIconBtn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(url);
          copyIconBtn.innerHTML = checkSvg();
          setTimeout(() => (copyIconBtn.innerHTML = clipboardSvg()), 1200);
        } catch {}
      };
      urlCodeEl.insertAdjacentElement('afterend', copyIconBtn);
    }

    const bulletWrap = document.createElement('ul');
    bulletWrap.style.margin = '12px 0';
    bulletWrap.style.padding = '0';
    bulletWrap.style.color = '#e9e9ea';
    bulletWrap.style.fontSize = '14px';
    bulletWrap.style.lineHeight = '1.6';
    bulletWrap.style.textAlign = 'left';
    (bulletWrap.style as any).listStyleType = 'disc';
    (bulletWrap.style as any).listStylePosition = 'inside';
    const bullets = [
      'Secret Recovery Phrase or password theft',
      'Malicious transactions resulting in stolen assets',
      'Listed on ChainPatrol or partner blocklists',
    ];
    bullets.forEach((t) => {
      const li = document.createElement('li');
      li.textContent = t;
      bulletWrap.appendChild(li);
    });

    const reasonBox = document.createElement('div');
    reasonBox.style.background = '#1a1212';
    reasonBox.style.border = '1px solid #3a2a2a';
    reasonBox.style.borderRadius = '10px';
    reasonBox.style.padding = '12px';
    reasonBox.style.color = '#ffb1b1';
    reasonBox.style.fontSize = '13px';
    reasonBox.style.marginBottom = '16px';
    reasonBox.textContent = String(reason);

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '12px';
    actions.style.marginTop = '8px';

    const backBtn = document.createElement('button');
    backBtn.textContent = 'Back to safety';
    backBtn.style.padding = '10px 16px';
    backBtn.style.borderRadius = '10px';
    backBtn.style.border = '1px solid #1f4ed4';
    backBtn.style.background = '#2b5cff';
    backBtn.style.color = '#fff';
    backBtn.style.fontWeight = '600';
    backBtn.style.cursor = 'pointer';
    backBtn.setAttribute('data-focusable', 'true');
    backBtn.onclick = () => {
      try {
        if (history.length > 1) history.back();
        else window.location.assign('https://google.com');
      } catch {
        window.location.assign('https://google.com');
      }
    };

    const proceedBtn = document.createElement('button');
    proceedBtn.textContent = 'Proceed anyway';
    proceedBtn.style.padding = '10px 16px';
    proceedBtn.style.borderRadius = '10px';
    proceedBtn.style.border = '1px solid #7a1a1a';
    proceedBtn.style.background = 'transparent';
    proceedBtn.style.color = '#ff6565';
    proceedBtn.style.fontWeight = '600';
    proceedBtn.style.cursor = 'pointer';
    proceedBtn.setAttribute('data-focusable', 'true');

    let countdown = 2;
    proceedBtn.disabled = true;
    const origProceedText = 'Proceed anyway';
    const tick = () => {
      if (countdown <= 0) {
        proceedBtn.disabled = false;
        proceedBtn.textContent = origProceedText;
        return;
      }
      proceedBtn.textContent = `${origProceedText} (${countdown})`;
      countdown -= 1;
      setTimeout(tick, 1000);
    };
    setTimeout(tick, 0);

    const bypassWrap = document.createElement('label');
    bypassWrap.style.display = 'flex';
    bypassWrap.style.alignItems = 'center';
    bypassWrap.style.gap = '8px';
    bypassWrap.style.color = '#a6a6a8';
    bypassWrap.style.fontSize = '12px';
    // Place below the buttons, full width with some top margin
    bypassWrap.style.marginTop = '10px';
    bypassWrap.style.marginLeft = '2px';
    const bypassCb = document.createElement('input');
    bypassCb.type = 'checkbox';
    bypassCb.setAttribute('data-focusable', 'true');
    const bypassText = document.createElement('span');
    bypassText.textContent = 'Always allow this domain (24h)';
    bypassWrap.appendChild(bypassCb);
    bypassWrap.appendChild(bypassText);

    proceedBtn.onclick = () => {
      const mode: BypassMode = bypassCb.checked ? 'persist' : 'session';
      setBypassed(url, mode);
      document.documentElement.style.overflow = '';
      root.remove();
    };

    const footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.flexWrap = 'wrap';
    footer.style.gap = '12px';
    footer.style.alignItems = 'center';
    footer.style.justifyContent = 'space-between';
    footer.style.marginTop = '18px';
    footer.style.color = '#a6a6a8';
    footer.style.fontSize = '12px';

    const reportWrap = document.createElement('div');
    reportWrap.innerHTML =
      'If we\'re flagging a legitimate website, please <a href="https://chainpatrol.com" target="_blank" rel="noopener noreferrer" style="color:#8ab4ff; text-decoration: underline;">report a detection problem</a>.';

    const brand = document.createElement('div');
    brand.innerHTML =
      'Powered by <a href="https://chainpatrol.com" target="_blank" rel="noopener noreferrer" style="color:#8ab4ff; text-decoration: underline;">ChainPatrol</a>';
    brand.style.fontWeight = '600';
    brand.style.color = '#d6d6d6';

    actions.appendChild(backBtn);
    actions.appendChild(proceedBtn);

    card.appendChild(header);
    card.appendChild(subtitle);
    card.appendChild(bulletWrap);
    card.appendChild(reasonBox);
    card.appendChild(actions);
    // Render the bypass toggle underneath the buttons
    card.appendChild(bypassWrap);
    footer.appendChild(reportWrap);
    footer.appendChild(brand);
    card.appendChild(footer);
    root.appendChild(card);

    document.documentElement.style.overflow = 'hidden';
    (document.body || document.documentElement).appendChild(root);

    const focusables = Array.from(
      card.querySelectorAll('[data-focusable], button, [href], input, summary'),
    ) as HTMLElement[];
    const firstFocusable = (focusables[0] || backBtn) as HTMLElement;
    const lastFocusable = (focusables[focusables.length - 1] || proceedBtn) as HTMLElement;
    firstFocusable.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (focusables.length === 0) return;
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            (lastFocusable as HTMLElement).focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            (firstFocusable as HTMLElement).focus();
            e.preventDefault();
          }
        }
      } else if (e.key === 'Enter') {
        if (e.shiftKey) {
          if (!proceedBtn.disabled) proceedBtn.click();
        } else {
          backBtn.click();
        }
      } else if (e.key === 'Escape') {
        backBtn.click();
      }
    };
    root.addEventListener('keydown', onKey);

    const mq = window.matchMedia('(max-width: 480px)');
    const applyMobile = () => {
      if (mq.matches) {
        actions.style.flexDirection = 'column';
        backBtn.style.width = '100%';
        proceedBtn.style.width = '100%';
      } else {
        actions.style.flexDirection = 'row';
        backBtn.style.width = 'auto';
        proceedBtn.style.width = 'auto';
      }
    };
    applyMobile();
    mq.addEventListener?.('change', applyMobile as any);
  } catch (e) {
    log('overlay error', e);
  }
}

function renderSkipNotice(url: string) {
  try {
    const existing = document.getElementById('cp-antiphish-recent-toast');
    if (existing) return;

    const root = document.createElement('div');
    root.id = 'cp-antiphish-recent-toast';
    root.style.position = 'fixed';
    root.style.top = '16px';
    root.style.right = '16px';
    root.style.zIndex = '2147483647';
    root.style.background = '#0f0f12';
    root.style.border = '1px solid #2a2a2e';
    root.style.color = '#fff';
    root.style.borderRadius = '12px';
    root.style.boxShadow = '0 12px 40px rgba(0,0,0,0.45)';
    root.style.padding = '14px 16px 14px 14px';
    root.style.display = 'flex';
    root.style.alignItems = 'flex-start';
    root.style.gap = '12px';
    root.style.maxWidth = '420px';

    const icon = document.createElement('div');
    icon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 3.5l9 16.5H3L12 3.5z" stroke="#ffb020" stroke-width="1.5" fill="#231a00"/>
  <rect x="11" y="9" width="2" height="6" rx="1" fill="#ffb020"/>
  <circle cx="12" cy="17.5" r="1" fill="#ffb020"/>
</svg>`;

    const content = document.createElement('div');
    content.style.flex = '1 1 auto';
    content.style.minWidth = '0';
    const title = document.createElement('div');
    title.textContent = 'Malicious site detected';
    title.style.fontWeight = '800';
    title.style.fontSize = '14px';
    title.style.lineHeight = '1.2';

    const msg = document.createElement('div');
    msg.style.marginTop = '4px';
    msg.style.fontSize = '12px';
    msg.style.color = '#d6d6d6';
    msg.textContent = "Not blocked: you've been shown a warning recently.";

    const urlLine = document.createElement('div');
    urlLine.style.marginTop = '4px';
    urlLine.style.fontSize = '11px';
    urlLine.style.color = '#a6a6a8';
    urlLine.style.whiteSpace = 'nowrap';
    urlLine.style.overflow = 'hidden';
    urlLine.style.textOverflow = 'ellipsis';
    urlLine.textContent = url;

    const closeBtn = document.createElement('button');
    closeBtn.setAttribute('aria-label', 'Dismiss');
    closeBtn.title = 'Dismiss';
    closeBtn.style.border = 'none';
    closeBtn.style.background = 'transparent';
    closeBtn.style.color = '#c9c9c9';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.padding = '4px';
    closeBtn.style.marginLeft = '6px';
    closeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 6l12 12M18 6L6 18" stroke="#c9c9c9" stroke-width="2" stroke-linecap="round"/>
</svg>`;
    closeBtn.onclick = () => root.remove();

    content.appendChild(title);
    content.appendChild(msg);
    content.appendChild(urlLine);

    root.appendChild(icon);
    root.appendChild(content);
    root.appendChild(closeBtn);

    (document.body || document.documentElement).appendChild(root);
  } catch {}
}

async function main() {
  try {
    // Re-check the flag at runtime to honor recent changes
    const setting = await getAntiPhishEnabled();
    if (!setting) return;

    // Only handle in top-level browsing context; skip if inside iframes
    if (window.top !== window.self) return;

    // Avoid redirect loop on Fairside warning domain itself
    try {
      const host = location.hostname.toLowerCase();
      const path = location.pathname.toLowerCase();
      const isFairside = host.endsWith('fairside.io');
      const isFairsideWarning = isFairside && path.includes('/warning');
      if (isFairsideWarning) return;
    } catch {}

    let url = location.href;
    const recovered = extractOriginalFromMetaMaskWarning(url);
    if (recovered) {
      url = recovered;
      try {
        console.log('[Revoke][antiphish] recovered original URL from MetaMask warning:', url);
      } catch {}
    }
    try {
      console.log('[Revoke][antiphish] checking URL:', url);
    } catch {}
    if (isBypassed(url)) return;

    const result = await checkUrl(url);
    try {
      console.log('[Revoke][antiphish] result:', result);
    } catch {}
    const status = result && extractStatus(result);
    if (status === 'BLOCKED') {
      // If we recently redirected for this hostname, do not redirect again; show a toast instead
      if (isRecentlyVisited(url)) {
        renderSkipNotice(url);
        return;
      }

      // Commented out overlay popup and redirecting to Fairside warning page instead
      // renderBlockOverlay(url, result!);
      try {
        markRecentlyVisited(url);
        const target = `https://fairside.io/warning?url=${encodeURIComponent(url)}`;
        // Use top-level navigation and replace history so Back doesn't return to malicious site
        window.location.replace(target);
      } catch {
        // Fallback
        (location as any).href = `https://fairside.io/warning?url=${encodeURIComponent(url)}`;
      }
    }
  } catch (e) {
    log('runtime error', e);
  }
}

// Respect user toggle: default ON
(async () => {
  try {
    const enabled = await getAntiPhishEnabled();
    if (enabled) await main();
  } catch {
    // If anything goes wrong determining the flag, err on the safe side and do nothing
  }
})();
