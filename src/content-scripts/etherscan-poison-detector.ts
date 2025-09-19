// Etherscan address poisoning detector (ported from external extension)
// Note: This repo does not use Plasmo. This file is loaded via manifest matches for Etherscan only.

// Early signal that the content script is active on the page
try {
  console.log('[Revoke][etherscan-poison] content script loaded:', location.hostname, location.href);
} catch {}

function getPrimaryAddressLower(): string | null {
  try {
    const m = location.pathname.match(/\/address\/(0x[0-9a-fA-F]{40})/);
    if (m) return m[1].toLowerCase();
  } catch {}
  return null;
}

const ADDRESS_REGEX = /0x[a-fA-F0-9]{40}/g;
let __addressesPrintedOnce = false;
let __addressDict: Record<string, number> = Object.create(null);
let __printTimer: number | null = null;
const __flaggedElements = new WeakSet<Element>();
let __printSessionKey = location.pathname + location.hash;
type __FeeAddrStyle = { h: number; s: number; l: number; aBg: number; aSh: number; aHv: number };
const __styleByAddress: Record<string, __FeeAddrStyle> = Object.create(null);
let __addrHasErc20ByAddress: Record<string, boolean> = Object.create(null);
let __assignmentCount = 0;
const __BASE_HUE_COUNT = 14;
const __VARIANTS: Array<Omit<__FeeAddrStyle, 'h'>> = [
  { s: 90, l: 55, aBg: 0.1, aSh: 0.35, aHv: 0.18 },
  { s: 80, l: 45, aBg: 0.12, aSh: 0.4, aHv: 0.2 },
  { s: 85, l: 65, aBg: 0.12, aSh: 0.4, aHv: 0.2 },
  { s: 70, l: 50, aBg: 0.14, aSh: 0.42, aHv: 0.22 },
];

const __LOW_AMOUNT_THRESHOLD = 1;
let __addrTokenStats: Record<string, Record<string, { lowCount: number; total: number }>> = Object.create(null);

function resetAddressTracking(newKey?: string) {
  try {
    if (__printTimer) clearTimeout(__printTimer);
  } catch {}
  __addressesPrintedOnce = false;
  __addressDict = Object.create(null);
  if (newKey) __printSessionKey = newKey;
  try {
    for (const k in __styleByAddress) delete __styleByAddress[k];
    __assignmentCount = 0;
  } catch {}
}

function scheduleAddressPrintIfNeeded(updated: boolean) {
  if (__addressesPrintedOnce || !updated) return;
  if (__printTimer) clearTimeout(__printTimer);
  __printTimer = window.setTimeout(() => {
    try {
      console.log('[Revoke][etherscan-poison] addresses on page (lowercase):', __addressDict);
    } catch {}
    __addressesPrintedOnce = true;
    __printTimer = null;
  }, 1200);
}

function injectNetworkIdleHook() {
  try {
    if (document.getElementById('rev-network-idle-hook')) return;
    const s = document.createElement('script');
    s.id = 'rev-network-idle-hook';
    s.textContent = `(() => {
      try {
        const w = window; const k = '__rev_net_idle_installed__';
        if (w[k]) return; w[k] = true;
        let pending = 0; let timer = null;
        const schedule = () => { try { if (timer) clearTimeout(timer); timer = setTimeout(() => { w.dispatchEvent(new CustomEvent('rev_network_idle', { detail: { pending } })); }, 700); } catch {} };
        const inc = () => { pending++; };
        const dec = () => { pending = Math.max(0, pending - 1); schedule(); };
        const ofetch = w.fetch;
        if (typeof ofetch === 'function') {
          w.fetch = function(...args) { inc(); return ofetch.apply(this, args).finally(dec); };
        }
        const X = w.XMLHttpRequest;
        if (typeof X === 'function') {
          const NX = function() { const xhr = new X(); let sent = false; const osend = xhr.send; xhr.send = function(...a) { if (!sent) { sent = true; inc(); } return osend.apply(xhr, a); }; xhr.addEventListener('loadend', () => dec()); return xhr; };
          NX.prototype = X.prototype; w.XMLHttpRequest = NX;
        }
      } catch {}
    })();`;
    (document.head || document.documentElement).appendChild(s);
  } catch {}
}

function hammingDistance(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  let diff = Math.abs(a.length - b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) diff++;
  }
  return diff;
}

function arePoisonPair(a: string, b: string): boolean {
  const la = a.toLowerCase();
  const lb = b.toLowerCase();
  if (!la.startsWith('0x') || !lb.startsWith('0x') || la.length !== 42 || lb.length !== 42) return false;
  if (la === lb) return false;
  const shareFirst4 = la.slice(2, 6) === lb.slice(2, 6);
  const shareLast4 = la.slice(-4) === lb.slice(-4);
  if (!shareFirst4 || !shareLast4) return false;
  return hammingDistance(la, lb) >= 1;
}

function isSuspiciousAddress(candidate: string): boolean {
  const c = candidate.toLowerCase();
  if (!c.startsWith('0x') || c.length !== 42) return false;
  const pageAddr = getPrimaryAddressLower();
  if (pageAddr && c === pageAddr) return false;
  const distance = pageAddr ? hammingDistance(c, pageAddr) : 999;
  return distance <= 20;
}

function highlightInlineAddress(text: string): HTMLElement {
  const span = document.createElement('span');
  span.className = 'rev-addr-flagged-inline';
  span.setAttribute('data-rev-addr-flag', 'true');
  span.setAttribute('title', 'Address poisoning: very similar to another address on this page');
  span.textContent = text;
  return span;
}

function ensureStyleTag() {
  if (document.getElementById('rev-addr-style')) return;
  const style = document.createElement('style');
  style.id = 'rev-addr-style';
  style.textContent = `
    .rev-addr-flagged-inline {
      position: relative;
      display: inline-block;
      background: var(--rev-bg-color, rgba(255, 99, 71, 0.1));
      border-radius: 4px;
      box-shadow: inset 0 0 0 1px var(--rev-shadow-color, rgba(255, 99, 71, 0.35));
      padding: 0 2px;
      transition: background 120ms ease;
      overflow: visible !important;
    }
    .rev-addr-flagged-inline:hover { background: var(--rev-bg-hover, rgba(255, 99, 71, 0.18)); }
    .rev-addr-flagged-inline::after {
      content: 'Potential Address poisoning';
      position: absolute;
      top: -12px;
      left: -8px;
      font-size: 8px;
      line-height: 1;
      padding: 3px 5px;
      color: #000;
      background: var(--rev-badge-bg, rgb(255, 215, 13));
      border-radius: 4px;
      white-space: nowrap;
      z-index: 1000;
      pointer-events: none;
      box-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
  `;
  document.documentElement.appendChild(style);
}

function scanAddressPoisoning(root: ParentNode = document.body) {
  try {
    ensureStyleTag();
    const getStyleForAddress = (addr: string): __FeeAddrStyle => {
      const key = addr.toLowerCase();
      const found = __styleByAddress[key];
      if (found) return found;
      let baseIdx: number;
      let variantIdx = 0;
      if (__assignmentCount < __BASE_HUE_COUNT) {
        baseIdx = __assignmentCount;
      } else {
        const idx = __assignmentCount - __BASE_HUE_COUNT;
        baseIdx = idx % __BASE_HUE_COUNT;
        variantIdx = Math.floor(idx / __BASE_HUE_COUNT) + 1;
      }
      const hue = Math.round((360 / __BASE_HUE_COUNT) * baseIdx) % 360;
      const variant = __VARIANTS[variantIdx % __VARIANTS.length];
      const style: __FeeAddrStyle = {
        h: hue,
        s: variant.s,
        l: variant.l,
        aBg: variant.aBg,
        aSh: variant.aSh,
        aHv: variant.aHv,
      };
      __styleByAddress[key] = style;
      __assignmentCount++;
      return style;
    };
    const applyColorToElement = (el: HTMLElement, addr: string) => {
      const st = getStyleForAddress(addr);
      const badge = `hsl(${st.h}, ${st.s}%, ${st.l}%)`;
      const bg = `hsla(${st.h}, ${st.s}%, ${st.l}%, ${st.aBg})`;
      const shadow = `hsla(${st.h}, ${st.s}%, ${st.l}%, ${st.aSh})`;
      const hoverBg = `hsla(${st.h}, ${st.s}%, ${st.l}%, ${st.aHv})`;
      try {
        el.style.setProperty('--rev-badge-bg', badge);
        el.style.setProperty('--rev-bg-color', bg);
        el.style.setProperty('--rev-shadow-color', shadow);
        el.style.setProperty('--rev-bg-hover', hoverBg);
      } catch {}
    };

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    type TextOccurrence = { kind: 'text'; node: Text; start: number; end: number; text: string };
    type ElementOccurrence = { kind: 'element'; element: HTMLElement; text: string };
    type Occurrence = TextOccurrence | ElementOccurrence;
    const occurrencesByAddress: Record<string, Occurrence[]> = Object.create(null);
    const uniqueAddresses: string[] = [];

    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (!(node instanceof Text)) continue;
      const parent = node.parentElement;
      if (!parent) continue;
      if (parent.closest('[data-rev-addr-poison="true"], [data-rev-addr-flag="true"]')) continue;
      const text = node.nodeValue || '';
      if (text.length < 42) continue;
      let m: RegExpExecArray | null;
      ADDRESS_REGEX.lastIndex = 0;
      while ((m = ADDRESS_REGEX.exec(text))) {
        const matched = m[0];
        const addr = matched.toLowerCase();
        const occ: Occurrence = {
          kind: 'text',
          node: node as Text,
          start: m.index,
          end: m.index + matched.length,
          text: matched,
        };
        if (!occurrencesByAddress[addr]) {
          occurrencesByAddress[addr] = [occ];
          uniqueAddresses.push(addr);
        } else {
          occurrencesByAddress[addr].push(occ);
        }
      }
    }

    const attrSelectors =
      'a[href*="/address/0x"], [data-clipboard-text^="0x"], [title^="0x"], [data-bs-title^="0x"], [data-highlight-target^="0x"], [href^="/tx/0x"], [data-etherscan-hash^="0x"]';
    const elements = (root as Element).querySelectorAll?.(attrSelectors) as NodeListOf<HTMLElement> | undefined;
    if (elements) {
      elements.forEach((el) => {
        if (el.closest('[data-rev-addr-poison="true"], [data-rev-addr-flag="true"]')) return;
        let candidate: string | null = null;
        const href = (el as HTMLAnchorElement).getAttribute?.('href') || '';
        const hrefMatch = href.match(/0x[0-9a-fA-F]{40}/);
        if (hrefMatch) candidate = hrefMatch[0];
        if (!candidate) {
          const clip = el.getAttribute('data-clipboard-text') || '';
          const m = clip.match(/0x[0-9a-fA-F]{40}/);
          if (m) candidate = m[0];
        }
        if (!candidate) {
          const title = el.getAttribute('title') || el.getAttribute('data-bs-title') || '';
          const m = title.match(/0x[0-9a-fA-F]{40}/);
          if (m) candidate = m[0];
        }
        if (!candidate) return;
        const addr = candidate.toLowerCase();
        const occ: Occurrence = { kind: 'element', element: el, text: candidate };
        if (!occurrencesByAddress[addr]) {
          occurrencesByAddress[addr] = [occ];
          uniqueAddresses.push(addr);
        } else {
          occurrencesByAddress[addr].push(occ);
        }
      });
    }

    let updated = false;
    for (const addr of uniqueAddresses) {
      const count = occurrencesByAddress[addr]?.length ?? 0;
      if (__addressDict[addr] !== count) {
        __addressDict[addr] = count;
        updated = true;
      }
    }
    scheduleAddressPrintIfNeeded(updated);

    if (uniqueAddresses.length < 2) return;

    const groups: Record<string, string[]> = Object.create(null);
    for (const addr of uniqueAddresses) {
      if (!addr.startsWith('0x') || addr.length !== 42) continue;
      const key = addr.slice(2, 6) + '_' + addr.slice(-4);
      (groups[key] = groups[key] || []).push(addr);
    }
    const toFlag = new Set<string>();
    for (const key in groups) {
      const group = groups[key];
      if (!group || group.length < 2) continue;
      const filtered = group.filter((a) => group.some((b) => a !== b && arePoisonPair(a, b)));
      if (filtered.length < 2) continue;
      const anyErc = filtered.some((a) => !!__addrHasErc20ByAddress[a]);
      const allErc = filtered.every((a) => !!__addrHasErc20ByAddress[a]);
      if (anyErc && !allErc) {
        filtered.forEach((a) => {
          if (__addrHasErc20ByAddress[a]) toFlag.add(a);
        });
        try {
          const stats = __addrTokenStats || Object.create(null);
          const nonErc = filtered.filter((a) => !__addrHasErc20ByAddress[a]);
          if (nonErc.length >= 2) {
            const tokenSet: Record<string, true> = Object.create(null);
            for (const a of nonErc) {
              const s = stats[a];
              if (!s) continue;
              for (const t in s) tokenSet[t] = true;
            }
            const tokens = Object.keys(tokenSet);
            for (const t of tokens) {
              const entries = nonErc
                .map((a) => ({ a, stat: stats[a]?.[t] || null }))
                .filter((e) => e.stat && e.stat.total > 0) as Array<{
                a: string;
                stat: { lowCount: number; total: number };
              }>;
              if (entries.length < 2) continue;
              let maxRate = -1;
              const maxAddrs: string[] = [];
              for (const e of entries) {
                const rate = e.stat.lowCount / e.stat.total;
                if (rate > maxRate) {
                  maxRate = rate;
                  maxAddrs.length = 0;
                  maxAddrs.push(e.a);
                } else if (rate === maxRate) {
                  maxAddrs.push(e.a);
                }
              }
              maxAddrs.forEach((a) => toFlag.add(a));
            }
          }
        } catch {}
      } else if (!anyErc) {
        try {
          const stats = __addrTokenStats || Object.create(null);
          const tokenSet: Record<string, true> = Object.create(null);
          for (const a of filtered) {
            const s = stats[a];
            if (!s) continue;
            for (const t in s) tokenSet[t] = true;
          }
          const tokens = Object.keys(tokenSet);
          for (const t of tokens) {
            const entries = filtered
              .map((a) => ({ a, stat: stats[a]?.[t] || null }))
              .filter((e) => e.stat && e.stat.total > 0) as Array<{
              a: string;
              stat: { lowCount: number; total: number };
            }>;
            if (entries.length < 2) continue;
            let maxRate = -1;
            const maxAddrs: string[] = [];
            for (const e of entries) {
              const rate = e.stat.lowCount / e.stat.total;
              if (rate > maxRate) {
                maxRate = rate;
                maxAddrs.length = 0;
                maxAddrs.push(e.a);
              } else if (rate === maxRate) {
                maxAddrs.push(e.a);
              }
            }
            maxAddrs.forEach((a) => toFlag.add(a));
          }
        } catch {}
      } else {
        filtered.forEach((a) => toFlag.add(a));
      }
    }
    if (toFlag.size === 0) return;

    const matchesByNode = new Map<Text, TextOccurrence[]>();
    const elementMatches: ElementOccurrence[] = [];
    toFlag.forEach((addr) => {
      const occs = occurrencesByAddress[addr];
      if (!occs) return;
      for (const occ of occs) {
        if ((occ as TextOccurrence).kind === 'text') {
          const tOcc = occ as TextOccurrence;
          const list = matchesByNode.get(tOcc.node) || [];
          list.push(tOcc);
          matchesByNode.set(tOcc.node, list);
        } else {
          elementMatches.push(occ as ElementOccurrence);
        }
      }
    });

    for (const [textNode, occs] of matchesByNode.entries()) {
      const parent = textNode.parentElement;
      if (!parent) continue;
      if (parent.closest('[data-rev-addr-poison="true"]')) continue;
      const deduped = occs
        .sort((a, b) => a.start - b.start)
        .filter((occ, idx, arr) => arr.findIndex((o) => o.start === occ.start && o.end === occ.end) === idx);
      const full = textNode.nodeValue || '';
      const frag = document.createDocumentFragment();
      let last = 0;
      for (const occ of deduped) {
        if (occ.start > last) frag.appendChild(document.createTextNode(full.slice(last, occ.start)));
        const el = highlightInlineAddress(occ.text);
        el.setAttribute('data-rev-addr-poison', 'true');
        applyColorToElement(el as HTMLElement, occ.text);
        frag.appendChild(el);
        last = occ.end;
      }
      if (last < full.length) frag.appendChild(document.createTextNode(full.slice(last)));
      textNode.replaceWith(frag);
    }

    for (const occ of elementMatches) {
      let target = occ.element.closest('a[href*="/address/0x"]') as HTMLElement | null;
      if (!target) target = occ.element;
      if (!target) continue;
      if (__flaggedElements.has(target)) continue;
      if (target.getAttribute('data-rev-addr-poison') === 'true') continue;
      if (target.hasAttribute('data-clipboard-text')) continue;
      if (target.querySelector('[data-rev-addr-poison="true"]')) continue;
      if (target.closest('[data-rev-addr-poison="true"]')) continue;

      const tag = target.tagName?.toLowerCase?.() || '';
      if (tag === 'a') target.classList.add('rev-addr-flagged-inline');
      target.setAttribute('data-rev-addr-poison', 'true');
      applyColorToElement(target, occ.text);
      __flaggedElements.add(target);
    }
  } catch {}
}

function printUniqueAddressesSnapshot(root: ParentNode = document.body) {
  try {
    const dict: Record<string, number> = Object.create(null);
    const occ: Record<string, number> = Object.create(null);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = walker.nextNode())) {
      if (!(n instanceof Text)) continue;
      const t = n.nodeValue || '';
      if (t.length < 42) continue;
      ADDRESS_REGEX.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = ADDRESS_REGEX.exec(t))) {
        const a = m[0].toLowerCase();
        occ[a] = (occ[a] || 0) + 1;
      }
    }
    const attrSelectors =
      'a[href*="/address/0x"], [data-clipboard-text^="0x"], [title^="0x"], [data-bs-title^="0x"], [data-highlight-target^="0x"], [href^="/tx/0x"], [data-etherscan-hash^="0x"]';
    const els = (root as Element).querySelectorAll?.(attrSelectors) as NodeListOf<HTMLElement> | undefined;
    if (els) {
      els.forEach((el) => {
        let c: string | null = null;
        const href = (el as HTMLAnchorElement).getAttribute?.('href') || '';
        const mh = href.match(/0x[0-9a-fA-F]{40}/);
        if (mh) c = mh[0];
        if (!c) {
          const d =
            el.getAttribute('data-clipboard-text') ||
            el.getAttribute('data-highlight-target') ||
            el.getAttribute('title') ||
            el.getAttribute('data-bs-title') ||
            '';
          const m = d.match(/0x[0-9a-fA-F]{40}/);
          if (m) c = m[0];
        }
        if (c) {
          const a = c.toLowerCase();
          occ[a] = (occ[a] || 0) + 1;
        }
      });
    }
    for (const k in occ) dict[k] = occ[k];
    console.log('[Revoke][etherscan-poison] addresses snapshot (lowercase):', dict);
  } catch {}
}

type ParsedAddressCell = {
  address?: string | null;
  ensOrLabel?: string | null;
};

type ParsedTokenInfo = {
  name?: string | null;
  symbol?: string | null;
  address?: string | null;
};

type ParsedTransferRow = {
  txHash?: string | null;
  direction?: string | null;
  from?: ParsedAddressCell;
  to?: ParsedAddressCell;
  amount?: string | null;
  token?: ParsedTokenInfo;
};

let __parseTransfersTimer: number | null = null;

function parseAmountToNumber(raw: string | null | undefined): number | null {
  try {
    if (!raw) return null;
    const cleaned = String(raw)
      .replace(/[\,\u00A0]/g, '')
      .trim();
    const m = cleaned.match(/-?\d*\.?\d+(?:e[+-]?\d+)?/i);
    if (!m) return null;
    const n = Number(m[0]);
    if (!Number.isFinite(n)) return null;
    return n;
  } catch {}
  return null;
}

function buildAddrTokenStats(
  rows: ParsedTransferRow[],
): Record<string, Record<string, { lowCount: number; total: number }>> {
  const stats: Record<string, Record<string, { lowCount: number; total: number }>> = Object.create(null);
  try {
    for (const r of rows) {
      const tokenAddr = r.token?.address?.toLowerCase() || null;
      if (!tokenAddr) continue;
      const amountNum = parseAmountToNumber(r.amount);
      if (amountNum == null) continue;
      const addresses = [r.from?.address, r.to?.address];
      for (const ar of addresses) {
        const addr = ar?.toLowerCase() || null;
        if (!addr) continue;
        const byToken = stats[addr] || (stats[addr] = Object.create(null));
        const bucket = byToken[tokenAddr] || (byToken[tokenAddr] = { lowCount: 0, total: 0 });
        bucket.total++;
        if (amountNum <= __LOW_AMOUNT_THRESHOLD) bucket.lowCount++;
      }
    }
  } catch {}
  return stats;
}

function extractAddressFromElement(el: Element | null): string | null {
  if (!el) return null;
  try {
    const a = el as HTMLAnchorElement;
    const href = a.getAttribute?.('href') || '';
    const mHref = href.match(/0x[0-9a-fA-F]{40}/);
    if (mHref) return mHref[0];
  } catch {}
  try {
    const v =
      el.getAttribute('data-highlight-target') ||
      el.getAttribute('data-address') ||
      el.getAttribute('data-clipboard-text') ||
      el.getAttribute('title') ||
      el.getAttribute('data-bs-title') ||
      '';
    const m = v.match(/0x[0-9a-fA-F]{40}/);
    if (m) return m[0];
  } catch {}
  try {
    const t = el.textContent || '';
    const m = t.match(/0x[0-9a-fA-F]{40}/);
    if (m) return m[0];
  } catch {}
  return null;
}

function extractEnsOrLabel(el: Element | null): string | null {
  if (!el) return null;
  try {
    const ens = el.querySelector('.hash-tag')?.textContent?.trim();
    if (ens) return ens;
  } catch {}
  try {
    const t = el.getAttribute('data-bs-title') || el.getAttribute('title') || '';
    if (t) {
      const clean = t.replace(/<br\/>/gi, ' ');
      const parts = clean.split(/\(0x[0-9a-fA-F]{40}\)/);
      const label = parts[0]?.trim();
      if (label) return label;
    }
  } catch {}
  return null;
}

function extractAddressFromCell(td: HTMLElement | null): ParsedAddressCell {
  const cell: ParsedAddressCell = { address: null, ensOrLabel: null };
  if (!td) return cell;
  try {
    const candidateEls: Element[] = [];
    td.querySelectorAll(
      '[data-highlight-target], [data-address], [data-clipboard-text], a[href*="/address/0x"]',
    ).forEach((e) => candidateEls.push(e));
    if (candidateEls.length === 0) candidateEls.push(td);
    for (const e of candidateEls) {
      const addr = extractAddressFromElement(e);
      if (addr) {
        cell.address = addr;
        cell.ensOrLabel = extractEnsOrLabel(td);
        break;
      }
    }
  } catch {}
  return cell;
}

function extractTokenFromCell(td: HTMLElement | null): ParsedTokenInfo {
  const token: ParsedTokenInfo = { name: null, symbol: null, address: null };
  if (!td) return token;
  try {
    const link = td.querySelector('a[href^="/token/0x"]') as HTMLAnchorElement | null;
    const href = link?.getAttribute('href') || '';
    const m = href.match(/0x[0-9a-fA-F]{40}/);
    if (m) token.address = m[0];
  } catch {}
  try {
    const name = td.querySelector('.hash-tag')?.textContent?.trim();
    if (name) token.name = name;
    const rawSymbol = td.querySelector('.text-muted')?.textContent || '';
    if (rawSymbol) token.symbol = rawSymbol.replace(/[()]/g, '').trim();
    if (!token.name) {
      const text = (td.textContent || '').trim();
      if (text) token.name = text;
    }
  } catch {}
  return token;
}

function parseTransferRow(tr: HTMLTableRowElement): ParsedTransferRow | null {
  try {
    const txA = tr.querySelector('a[href^="/tx/0x"]') as HTMLAnchorElement | null;
    const txHash = txA?.textContent?.trim() || txA?.getAttribute('data-clipboard-text') || null;
    const tds = Array.from(tr.children) as HTMLElement[];
    let dirIdx = -1;
    let direction: string | null = null;
    for (let i = 0; i < tds.length; i++) {
      const badge = tds[i].querySelector('span.badge') as HTMLElement | null;
      if (!badge) continue;
      const txt = (badge.textContent || '').trim().toUpperCase();
      if (txt === 'IN' || txt === 'OUT') {
        dirIdx = i;
        direction = txt;
        break;
      }
    }
    if (dirIdx === -1) return null;
    const fromTd = tds[dirIdx - 1] || null;
    const toTd = tds[dirIdx + 1] || null;
    const amountTd = tds[dirIdx + 2] || null;
    const tokenTd = tds[dirIdx + 3] || null;
    const from = extractAddressFromCell(fromTd);
    const to = extractAddressFromCell(toTd);
    const amountSpan = amountTd?.querySelector('.td_showAmount, .d-flex .td_showAmount, span') as HTMLElement | null;
    let amount = amountSpan?.textContent?.trim() || null;
    if (!amount) amount = (amountTd?.textContent || '').trim() || null;
    const token = extractTokenFromCell(tokenTd);
    return { txHash, direction, from, to, amount, token };
  } catch {}
  return null;
}

function collectTransferRows(root: ParentNode = document.body): ParsedTransferRow[] {
  const rows: ParsedTransferRow[] = [];
  try {
    const scope = (root as Element) || document.body;
    const trList = scope.querySelectorAll?.('tr') as NodeListOf<HTMLTableRowElement> | undefined;
    if (!trList) return rows;
    trList.forEach((tr) => {
      if (!tr.querySelector('a[href^="/tx/0x"]')) return;
      const parsed = parseTransferRow(tr);
      if (parsed) rows.push(parsed);
    });
  } catch {}
  return rows;
}

function scheduleCollectAndExpose(root: ParentNode = document.body) {
  try {
    if (__parseTransfersTimer) clearTimeout(__parseTransfersTimer);
  } catch {}
  __parseTransfersTimer = window.setTimeout(() => {
    try {
      const data = collectTransferRows(root);
      try {
        (window as any).__rev_lastTransfers = data;
      } catch {}
      try {
        __addrTokenStats = buildAddrTokenStats(data);
      } catch {}
      try {
        const map: Record<string, boolean> = Object.create(null);
        const looksGenericErc20 = (name: string | null | undefined): boolean => {
          if (!name) return false;
          const n = name.toLowerCase();
          return n.includes('erc-20') || n.includes('erc20') || n.startsWith('erc-20:') || n.startsWith('erc20:');
        };
        for (const r of data) {
          const flag = looksGenericErc20(r.token?.name);
          if (!flag) continue;
          const fromAddr = r.from?.address?.toLowerCase() || null;
          const toAddr = r.to?.address?.toLowerCase() || null;
          let counterparty: string | null = null;
          const pageAddr = getPrimaryAddressLower();
          if (pageAddr && fromAddr === pageAddr) counterparty = toAddr;
          else if (pageAddr && toAddr === pageAddr) counterparty = fromAddr;
          else counterparty = toAddr || fromAddr;
          if (counterparty) map[counterparty] = true;
        }
        __addrHasErc20ByAddress = map;
      } catch {}
      try {
        console.log('[Revoke][etherscan-poison] parsed transfer rows:', data);
        const flat = data.map((r) => ({
          txHash: r.txHash || '',
          direction: r.direction || '',
          fromAddress: r.from?.address || '',
          fromLabel: r.from?.ensOrLabel || '',
          toAddress: r.to?.address || '',
          toLabel: r.to?.ensOrLabel || '',
          amount: r.amount || '',
          tokenAddress: r.token?.address || '',
          tokenSymbol: r.token?.symbol || '',
          tokenName: r.token?.name || '',
        }));
        console.table(flat);
      } catch {}
    } catch {}
    __parseTransfersTimer = null;
  }, 800);
}

function scan(root: ParentNode = document.body) {
  try {
    try {
      const data = collectTransferRows(root);
      const map: Record<string, boolean> = Object.create(null);
      const looksGenericErc20 = (name: string | null | undefined): boolean => {
        if (!name) return false;
        const n = (name || '').toLowerCase();
        return n.includes('erc-20') || n.includes('erc20') || n.startsWith('erc-20:') || n.startsWith('erc20:');
      };
      for (const r of data) {
        const flag = looksGenericErc20(r.token?.name);
        if (!flag) continue;
        const fromAddr = r.from?.address?.toLowerCase() || null;
        const toAddr = r.to?.address?.toLowerCase() || null;
        let counterparty: string | null = null;
        const pageAddr = getPrimaryAddressLower();
        if (pageAddr && fromAddr === pageAddr) counterparty = toAddr;
        else if (pageAddr && toAddr === pageAddr) counterparty = fromAddr;
        else counterparty = toAddr || fromAddr;
        if (counterparty) map[counterparty] = true;
      }
      __addrHasErc20ByAddress = map;
      try {
        __addrTokenStats = buildAddrTokenStats(data);
      } catch {}
    } catch {}
    scanAddressPoisoning(root);
    scheduleCollectAndExpose(root);
  } catch {}
}

function init() {
  if (!/etherscan\./.test(location.hostname)) return;
  try {
    console.log('[Revoke][etherscan-poison] detected etherscan host:', location.hostname);
  } catch {}
  injectNetworkIdleHook();
  scan();
  try {
    const ifr = document.getElementById('tokenpageiframe') as HTMLIFrameElement | null;
    if (ifr && ifr.contentDocument) {
      const iDoc = ifr.contentDocument;
      const scanIframe = () => {
        try {
          scan(iDoc);
        } catch {}
      };
      iDoc.addEventListener('DOMContentLoaded', scanIframe);
      iDoc.addEventListener('load', scanIframe);
      const mo2 = new MutationObserver(() => scan(iDoc));
      mo2.observe(iDoc.documentElement, { childList: true, subtree: true, characterData: true });
    }
  } catch {}
  window.addEventListener(
    'rev_network_idle',
    () => {
      try {
        console.log('[Revoke][etherscan-poison] network idle → rescan (delayed 1.5s)');
      } catch {}
      setTimeout(() => {
        resetAddressTracking(location.pathname + location.hash);
        scan();
      }, 1500);
    },
    { passive: true },
  );

  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList') {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === Node.ELEMENT_NODE) scan(n as Element);
        });
      } else if (m.type === 'characterData') {
        const el = (m.target as CharacterData).parentElement;
        if (el) scan(el);
      }
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true });

  const handleNav = () => {
    const newKey = location.pathname + location.hash;
    if (newKey === __printSessionKey) return;
    try {
      console.log('[Revoke][etherscan-poison] navigation detected → rescan for addresses');
    } catch {}
    resetAddressTracking(newKey);
    scan();
    setTimeout(() => printUniqueAddressesSnapshot(), 1600);
  };
  window.addEventListener('hashchange', handleNav);
  window.addEventListener('popstate', handleNav);
}

try {
  init();
} catch {}
