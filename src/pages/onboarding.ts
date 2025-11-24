// @ts-nocheck
import en from '../i18n/locales/en/translation.json';
import es from '../i18n/locales/es/translation.json';
import ja from '../i18n/locales/ja/translation.json';
import ru from '../i18n/locales/ru/translation.json';
import zh from '../i18n/locales/zh_CN/translation.json';

declare const chrome: typeof globalThis.chrome;
declare const browser: typeof globalThis.browser;

type Messages = typeof en;
const messagesMap = { en, es, ja, ru, zh } as const;
type Locale = keyof typeof messagesMap;
const locales: Locale[] = ['en', 'es', 'ja', 'ru', 'zh'];
const STORAGE_LOCALE_KEY = 'settings:locale';

let currentLocale: Locale = 'en';
let currentMessages: Messages = en;

const root = document.getElementById('ob-root');
if (!root) {
  throw new Error('Onboarding root element not found');
}

const messagesReady = resolveAndApplyLocale();

async function resolveAndApplyLocale() {
  const locale = await detectLocale();
  currentLocale = locale;
  currentMessages = messagesMap[locale] ?? en;
  document.documentElement?.setAttribute('lang', locale);
  document.title = t('onboarding.meta.title', undefined, document.title);
  translateDom(document);
}

async function detectLocale(): Promise<Locale> {
  try {
    const stored = await getStoredLocale();
    if (stored && isLocale(stored)) {
      return stored;
    }
  } catch {
    /* ignore */
  }

  const browserLocale = chrome?.i18n?.getUILanguage
    ? chrome.i18n.getUILanguage().split('-')[0]
    : navigator.language?.split('-')[0];
  if (isLocale(browserLocale)) {
    return browserLocale;
  }
  return 'en';
}

async function getStoredLocale(): Promise<string | undefined> {
  const storageArea = chrome?.storage?.sync ?? browser?.storage?.sync;
  if (!storageArea) return undefined;

  const area: any = storageArea;
  if (area.get.length <= 1) {
    // Promise-based (Firefox)
    try {
      const result = await area.get(STORAGE_LOCALE_KEY);
      return result?.[STORAGE_LOCALE_KEY];
    } catch {
      return undefined;
    }
  }

  return new Promise((resolve) => {
    area.get([STORAGE_LOCALE_KEY], (result: Record<string, string>) => {
      if (chrome.runtime?.lastError) {
        resolve(undefined);
        return;
      }
      resolve(result?.[STORAGE_LOCALE_KEY]);
    });
  });
}

const isLocale = (value: unknown): value is Locale => typeof value === 'string' && locales.includes(value as Locale);

const getNestedValue = (obj: Record<string, any>, key: string): any =>
  key.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), obj);

function formatValue(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, token) =>
    Object.prototype.hasOwnProperty.call(vars, token) ? String(vars[token]) : '',
  );
}

function t(key: string, vars?: Record<string, string | number>, fallback?: string) {
  const raw = getNestedValue(currentMessages as Record<string, any>, key);
  if (typeof raw === 'string') {
    return formatValue(raw, vars);
  }
  if (fallback) return fallback;
  return key;
}

function translateDom(scope: ParentNode | Document) {
  scope.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    el.textContent = t(key);
  });

  scope.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    if (!key) return;
    el.innerHTML = t(key);
  });

  scope.querySelectorAll<HTMLElement>('[data-i18n-attrs]').forEach((el) => {
    const attrMap = el.getAttribute('data-i18n-attrs');
    if (!attrMap) return;
    attrMap.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (!attr || !key) return;
      el.setAttribute(attr, t(key));
    });
  });
}

const STEP_ORDER = [
  'landing',
  'watchlist',
  'simulator',
  'address-poisoning',
  'google-ads',
  'antiphish',
  'coverage',
  'experimental-features',
  'summary',
];
const storage = chrome?.storage?.local ?? browser?.storage?.local;
const KEYS = { hasOnboarded: 'ob_hasOnboarded', dismissed: 'ob_dismissed' };

function stepUrl(step) {
  return chrome.runtime.getURL(`onboarding/steps/${step}.html`);
}

function currentStep() {
  const h = location.hash.replace('#', '') || STEP_ORDER[0] || 'step';
  return STEP_ORDER.includes(h) ? h : STEP_ORDER[0];
}

async function loadStep(step) {
  await messagesReady;
  const res = await fetch(stepUrl(step));
  const html = await res.text();
  root.innerHTML = html;
  translateDom(root);

  hydrateLegacyButtons();
  updateProgress(step);

  if (stepInits[step]) await stepInits[step]();

  if (typeof window.onScreenChange === 'function') window.onScreenChange(step);
}

function updateProgress(step) {
  const i = STEP_ORDER.indexOf(step);
  root.querySelectorAll('[data-ob-progress]').forEach((el) => (el.textContent = `${i + 1}/${STEP_ORDER.length}`));
}

function go(step) {
  location.hash = `#${step}`;
}
function next() {
  const i = STEP_ORDER.indexOf(currentStep());
  go(STEP_ORDER[Math.min(i + 1, STEP_ORDER.length - 1)]);
}
function back() {
  const i = STEP_ORDER.indexOf(currentStep());
  go(STEP_ORDER[Math.max(i - 1, 0)]);
}

async function finish(dontShow) {
  await storage.set({ [KEYS.hasOnboarded]: true, [KEYS.dismissed]: !!dontShow });
  window.close();
}

async function openExtension() {
  const url = chrome.runtime.getURL('popup.html');

  try {
    if (chrome.action?.openPopup) {
      await chrome.action.openPopup();
      return;
    }
  } catch (_) {}
}

function animateCoverageAmount(el, from, to, duration) {
  const start = performance.now();
  const increasing = to > from; // decide direction once

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);

    // number
    const value = Math.floor(from + (to - from) * progress);
    el.textContent = '$' + value.toLocaleString();

    // color: red(255,82,82) <-> green(0,255,136)
    // t maps 0 -> red, 1 -> green
    const t = increasing ? progress : 1 - progress;
    const r = Math.round(255 * (1 - t)); // 255 -> 0
    const g = Math.round(82 + (255 - 82) * t); // 82  -> 255
    const b = Math.round(82 + (136 - 82) * t); // 82  -> 136
    el.style.color = `rgb(${r},${g},${b})`;

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      // snap to the exact end state to avoid rounding drift
      el.textContent = '$' + to.toLocaleString();
      el.style.color = to <= 0 ? '#ff5252' : '#00ff88';
    }
  }

  requestAnimationFrame(frame);
}

function extractTargetFromOnclick(el) {
  const oc = el.getAttribute('onclick') || '';
  const m = oc.match(/showScreen\(['"]([^'"]+)['"]\)/);
  return m && m[1];
}

function hydrateLegacyButtons() {
  const candidates = root.querySelectorAll('[onclick*="showScreen("]');
  candidates.forEach((el) => {
    const target = extractTargetFromOnclick(el);
    if (!target) return;
    el.removeAttribute('onclick');
    el.addEventListener('click', () => go(target), { once: true });
  });
}

let handlersBound = false;
function bindDelegatedHandlersOnce() {
  if (handlersBound) return;
  root.addEventListener('click', async (e) => {
    const t = e.target.closest?.('[data-ob-action]');
    if (!t) return;
    const action = t.getAttribute('data-ob-action');
    if (action === 'next') return next();
    if (action === 'back') return back();
    if (action === 'open-extension') return openExtension();

    if (action === 'skip' || action === 'done') {
      const dontShow = root.querySelector('#ob-dont-show-again')?.checked;
      return finish(dontShow);
    }
  });
  handlersBound = true;
}

window.onScreenChange = (id) => {
  const map = Object.fromEntries(STEP_ORDER.map((s, i) => [s, Math.round((i * 100) / (STEP_ORDER.length - 1))]));
  const pct = map[id] ?? 0;
  root.querySelectorAll('.progress-bar').forEach((bar) => (bar.style.width = pct + '%'));

  if (id === 'watchlist') {
    const step = document.querySelector('[data-step="watchlist"]');
    if (!step) return;
    step.classList.add('sequence-v2');
    step.classList.remove('ready'); // reset if revisiting
    step.getBoundingClientRect(); // reflow
    requestAnimationFrame(() => step.classList.add('ready'));
  }

  if (id === 'simulator') {
    const step = document.querySelector('[data-step="simulator"]');
    if (!step) return;
    step.classList.add('sequence-v2');
    step.classList.remove('ready');
    step.getBoundingClientRect();
    requestAnimationFrame(() => step.classList.add('ready'));
  }

  if (id === 'address-poisoning') {
    const step = document.querySelector('[data-step="address-poisoning"]');
    if (!step) return;
    step.classList.add('sequence-v2');
    step.classList.remove('ready');
    step.getBoundingClientRect();
    requestAnimationFrame(() => step.classList.add('ready'));
  }
  if (id === 'antiphish') {
    const step = document.querySelector('[data-step="antiphish"]');
    if (!step) return;
    step.classList.add('sequence-v2');
    step.classList.remove('ready');
    step.getBoundingClientRect();
    requestAnimationFrame(() => step.classList.add('ready'));
    // Ensure default ON the first time (seed storage if undefined)
    try {
      storage.get([FEATURE_KEYS.ANTIPHISH]).then((res) => {
        if (typeof res[FEATURE_KEYS.ANTIPHISH] === 'undefined') {
          storage.set({ [FEATURE_KEYS.ANTIPHISH]: true }).then(() => {
            const btn = step.querySelector('[data-ob-toggle="feature_antiphish_enabled"]');
            if (btn) btn.classList.add('on');
          });
        }
      });
    } catch (_) {}
  }
  if (id === 'google-ads') {
    const step = document.querySelector('[data-step="google-ads"]');
    if (!step) return;
    step.classList.remove('phase-3'); // <--- add this reset
    step.classList.add('sequence-v2');
    step.classList.remove('ready');
    step.getBoundingClientRect();
    requestAnimationFrame(() => step.classList.add('ready'));
  }

  if (id === 'coverage') {
    const step = document.querySelector('[data-step="coverage"]');
    if (!step) return;
    step.classList.add('sequence-v2');
    step.classList.remove('ready');
    step.getBoundingClientRect();
    requestAnimationFrame(() => step.classList.add('ready'));
  }
  if (id === 'summary') {
    // Reflect final settings
    const map = {
      'simulator-status': FEATURE_KEYS?.SIMULATOR,
      'ads-status': FEATURE_KEYS?.GOOGLE_AD_WARN,
      'antiphish-status': FEATURE_KEYS?.ANTIPHISH,
      'address-status': FEATURE_KEYS?.ADDRESS_GUARD,
      'coverage-status': FEATURE_KEYS?.COVERAGE,
    };
    const keys = Object.values(map).filter(Boolean);
    storage.get(keys).then((res) => {
      const setStatus = (elId, key) => {
        const el = document.getElementById(elId);
        if (!el) return;
        const enabled = !!res[key];
        el.classList.toggle('status-on', enabled);
        el.classList.toggle('status-off', !enabled);
        const statusKey = enabled ? 'onboarding.common.status_on' : 'onboarding.common.status_off';
        el.innerHTML = `<span class="status-dot"></span>${t(statusKey)}`;
      };
      Object.entries(map).forEach(([id, key]) => setStatus(id, key));
    });
  }
};

window.addEventListener('hashchange', () => loadStep(currentStep()));

bindDelegatedHandlersOnce();
loadStep(currentStep());

const FEATURE_KEYS = {
  SIMULATOR: 'feature_simulator_enabled',
  GOOGLE_AD_WARN: 'feature_google_ad_warn_enabled',
  COINGECKO_AD_WARN: 'feature_coingecko_ad_warn_enabled',
  DEXTOOLS_AD_WARN: 'feature_dextools_ad_warn_enabled',
  DEXSCREENER_AD_WARN: 'feature_dexscreener_ad_warn_enabled',
  X_OP_DETECTOR: 'feature_x_op_detector_enabled',
  ETHOS_SCORE: 'feature_ethos_score_enabled',
  SLOWMODE: 'feature_slowmode_enabled',
  ADDRESS_GUARD: 'feature_address_guard_enabled',
  COVERAGE: 'feature_coverage_enabled',
  ANTIPHISH: 'feature_antiphish_enabled',
};

async function bindFeatureToggle(scope, key, defaultOn = true) {
  if (!scope) return;
  const btn = scope.querySelector(`[data-ob-toggle="${key}"]`);
  if (!btn) return;

  const data = await storage.get([key]);
  let enabled = data[key];

  if (typeof enabled === 'undefined') {
    enabled = !!defaultOn;
    await storage.set({ [key]: enabled }); // persist it
  }

  btn.classList.toggle('on', enabled);

  btn.addEventListener('click', async () => {
    const next = !btn.classList.contains('on');
    btn.classList.toggle('on', next);
    await storage.set({ [key]: next });
  });
}

function ensureTwitterWidgets(cb) {
  if (window.twttr && window.twttr.widgets?.load) {
    cb?.();
    return;
  }
  if (document.getElementById('twitter-wjs')) {
    const t = setInterval(() => {
      if (window.twttr && window.twttr.widgets?.load) {
        clearInterval(t);
        cb?.();
      }
    }, 50);
    return;
  }
  const s = document.createElement('script');
  s.id = 'twitter-wjs';
  s.async = true;
  s.src = 'https://platform.twitter.com/widgets.js';
  s.onload = () => cb?.();
  document.head.appendChild(s);
}

async function initStepWithToggle(step, key) {
  const scope = root.querySelector(`[data-step="${step}"]`);
  if (!scope) return;
  requestAnimationFrame(() => scope.classList.add('show'));
  await bindFeatureToggle(scope, key);
}
function tryLoadImage(img, url, ok, fail) {
  const test = new Image();
  test.onload = () => {
    ok(url);
  };
  test.onerror = () => {
    fail && fail(url);
  };
  test.src = url;
}

function loadFirstWorkingImage(img, relCandidates, fallbackText = '?') {
  // Build absolute candidates via chrome.runtime.getURL
  const absolute = relCandidates.map((rel) => (chrome.runtime?.getURL ? chrome.runtime.getURL(rel) : rel));

  function attempt(index) {
    if (index >= absolute.length) {
      console.warn('[ethos-img] All candidates failed for', relCandidates[0]);
      // fallback: show an initial badge if nothing worked
      img.removeAttribute('src');
      img.classList.add('ethos-fallback');
      img.setAttribute('data-fallback', fallbackText);
      return;
    }
    const url = absolute[index];
    tryLoadImage(
      img,
      url,
      (goodUrl) => {
        img.src = goodUrl;
        console.log('[ethos-img] Loaded:', goodUrl);
      },
      () => {
        console.warn('[ethos-img] Failed:', url, '— trying next');
        attempt(index + 1);
      },
    );
  }
  attempt(0);
}

const stepInits = {
  simulator: async () => {
    const scope = root.querySelector('[data-step="simulator"]');
    if (!scope) return;

    const dots = Array.from(scope.querySelectorAll('.sim-dot'));
    const phone = scope.querySelector('#sim-phone');
    const preview = scope.querySelector('#sim-preview');
    const el = {
      sendAmt: scope.querySelector('#sim-send-amount'),
      sendTok: scope.querySelector('#sim-send-token'),
      recvAmt: scope.querySelector('#sim-recv-amount'),
      recvTok: scope.querySelector('#sim-recv-token'),
      fee: scope.querySelector('#sim-fee'),
      critical: scope.querySelector('#sim-critical-warning'),
      site: scope.querySelector('#sim-site-name'),
    };

    let idx = 0;
    let timer;

    function animatePreview() {
      preview.classList.remove('enter', 'show');
      preview.getBoundingClientRect();
      preview.classList.add('enter');
      requestAnimationFrame(() => preview.classList.add('show'));
    }

    function apply(i) {
      idx = i;
      dots.forEach((d, j) => d.classList.toggle('active', j === i));

      const previewCard = preview; // #sim-preview
      const siteIcon = scope.querySelector('.sim-site-icon');
      const siteName = el.site;

      const flowItems = Array.from(scope.querySelectorAll('.sim-flow-item'));
      // Row containers for first and second transaction rows
      const rowFirst = flowItems[0];
      const rowSecond = flowItems[1];
      const feeRow = scope.querySelector('#sim-network-fee');
      const labelSend = flowItems[0].querySelector('.sim-flow-label');
      const labelSecond = flowItems[1].querySelector('.sim-flow-label');
      const amtSend = el.sendAmt;
      const tokSend = el.sendTok;
      const amtRecv = el.recvAmt;
      const tokRecv = el.recvTok;

      previewCard.classList.remove('critical');
      el.critical.classList.remove('show');
      // Ensure both rows are visible by default (used for slides 0 and 2)
      if (rowFirst) rowFirst.style.display = '';
      if (rowSecond) rowSecond.style.display = '';
      if (feeRow) feeRow.style.display = '';
      labelSend.textContent = t('onboarding.simulator.preview.send_label');
      labelSecond.textContent = t('onboarding.simulator.preview.receive_label');
      amtSend.classList.remove('in');
      amtSend.classList.add('out');
      amtRecv.classList.remove('out');
      amtRecv.classList.add('in');
      tokSend.classList.remove('fake');
      tokRecv.classList.remove('fake');
      siteIcon.textContent = 'r';
      siteName.textContent = 'Uniswap';
      const confirmBtn = scope.querySelector('#sim-confirm-btn');
      confirmBtn.classList.remove('danger');
      confirmBtn.textContent = t('common.continue');

      if (i === 0) {
        siteName.textContent = 'Uniswap';
        amtSend.textContent = '-1.5';
        tokSend.textContent = 'ETH';
        amtRecv.textContent = '+1.5';
        tokRecv.textContent = 'ETH';
        el.fee.textContent = '~$8.42';
      } else if (i === 1) {
        siteName.textContent = t('onboarding.simulator.preview.unknown_site', undefined, 'Unknown Site');
        labelSecond.textContent = t('onboarding.simulator.preview.send_label');
        // Hide the first row (WETH) on the second slide
        if (rowFirst) rowFirst.style.display = 'none';
        // Hide network fee on the second slide only
        if (feeRow) feeRow.style.display = 'none';
        amtSend.textContent = '-2.8';
        tokSend.textContent = 'WETH';
        amtRecv.textContent = '-8,450';
        tokRecv.textContent = 'LINK';

        amtRecv.classList.remove('in');
        amtRecv.classList.add('out');
        tokRecv.classList.add('fake');

        previewCard.classList.add('critical');
        // Show the critical risk banner on the second slide
        requestAnimationFrame(() => el.critical.classList.add('show'));

        confirmBtn.classList.add('danger');
        confirmBtn.textContent = t('onboarding.simulator.preview.proceed');

        el.fee.textContent = '~$9.10';
      } else {
        siteName.textContent = 'Aave';
        amtSend.textContent = '-3,846';
        tokSend.textContent = 'USDC';
        amtRecv.textContent = '+3,846';
        tokRecv.textContent = 'aUSDC';
        el.fee.textContent = '~$8.10';
      }

      animatePreview();
    }

    function next() {
      apply((idx + 1) % 3);
    }

    function startCycle() {
      stopCycle();
      timer = setInterval(next, 3000);
    }
    function stopCycle() {
      if (timer) clearInterval(timer);
    }

    phone.addEventListener('click', () => {
      stopCycle();
      next();
      startCycle();
    });
    dots.forEach((d) =>
      d.addEventListener('click', () => {
        stopCycle();
        apply(Number(d.dataset.index));
        startCycle();
      }),
    );

    apply(0);
    startCycle();

    await bindFeatureToggle(scope, FEATURE_KEYS.SIMULATOR);

    scope.addEventListener('remove', stopCycle);
  },

  'address-poisoning': async () => {
    const step = root.querySelector('[data-step="address-poisoning"]');
    if (!step) return;

    step.classList.add('sequence-v2');
    step.classList.remove('ready'); // reset if revisiting
    step.getBoundingClientRect();
    requestAnimationFrame(() => step.classList.add('ready'));
    await bindFeatureToggle(step, FEATURE_KEYS.ADDRESS_GUARD);

    const toggleBtn = step.querySelector('[data-ob-toggle="feature_address_guard_enabled"]');
    const rowsAll = Array.from(step.querySelectorAll('.tx-item'));
    const rowsPoison = Array.from(step.querySelectorAll('.tx-item[data-poison="true"]'));
    const allCharDiffs = Array.from(step.querySelectorAll('.tx-hash .char-diff'));

    // Capture original label state to restore when guard is OFF
    const originalLabelState = new Map();
    rowsAll.forEach((row) => {
      const label = row.querySelector('.tx-label');
      if (!label) return;
      originalLabelState.set(label, {
        text: label.textContent,
        classes: Array.from(label.classList),
      });
    });

    let t2, t3;
    const clearTimers = () => {
      if (t2) clearTimeout(t2);
      if (t3) clearTimeout(t3);
      t2 = t3 = undefined;
    };

    const restoreOriginalLabels = () => {
      rowsAll.forEach((row) => row.classList.remove('poison'));
      step.classList.remove('phase-2', 'phase-3');
      step.querySelectorAll('.poison-badge').forEach((b) => b.classList.remove('show'));
      allCharDiffs.forEach((el) => el.classList.remove('show-circle'));
      originalLabelState.forEach((state, label) => {
        label.className = 'tx-label';
        state.classes.forEach((c) => {
          if (c !== 'tx-label') label.classList.add(c);
        });
        label.textContent = state.text;
      });
    };

    const armPhases = () => {
      const cs = getComputedStyle(step);
      const toMs = (v) => (/\bms\b/i.test(v) ? parseFloat(v) : parseFloat(v || '0') * 1000);

      const attackDur = toMs(cs.getPropertyValue('--attack-dur')); // 0.85s
      const gap1 = toMs(cs.getPropertyValue('--gap-1')); // 0.25s
      const leftDur = toMs(cs.getPropertyValue('--left-dur')); // 0.6s
      const rowStagger = toMs(cs.getPropertyValue('--row-stagger')); // 0.1s
      const gap2 = toMs(cs.getPropertyValue('--gap-2')); // 0.4s
      const firstRowLead = 160;

      const phase2At = attackDur + gap1 + leftDur + firstRowLead + rowStagger * 5;
      const phase3At = attackDur + gap1 + leftDur + rowStagger * 5 + gap2;

      clearTimers();
      t2 = setTimeout(
        () => {
          step.classList.add('phase-2');
          rowsPoison.forEach((row) => {
            row.classList.add('poison');
            const label = row.querySelector('.tx-label');
            if (label) {
              label.classList.remove('received', 'you-send');
              label.classList.add('scammer');
              label.textContent = t('onboarding.address.labels.scammer');
            }
          });
        },
        Math.max(0, phase2At + 30),
      );

      t3 = setTimeout(
        () => {
          step.classList.add('phase-3');
          allCharDiffs.forEach((el) => el.classList.add('show-circle'));
          step.querySelectorAll('.poison-badge').forEach((b) => b.classList.add('show'));
        },
        Math.max(0, phase3At + 30),
      );
    };

    const applyDisabledState = () => {
      clearTimers();
      restoreOriginalLabels();
      step.classList.add('ap-disabled');
    };

    const applyEnabledState = () => {
      clearTimers();
      step.classList.remove('ap-disabled');
      restoreOriginalLabels();
      // restart the left/right "ready" animations cleanly
      step.classList.remove('ready');
      step.getBoundingClientRect();
      requestAnimationFrame(() => step.classList.add('ready'));
      armPhases();
    };

    const applyByToggle = () => {
      const enabled = toggleBtn?.classList.contains('on');
      if (enabled) applyEnabledState();
      else applyDisabledState();
    };

    // Initial application
    applyByToggle();
    // React to user toggling
    toggleBtn?.addEventListener('click', () => setTimeout(applyByToggle, 50));
  },

  'google-ads': async () => {
    const scope = root.querySelector('[data-step="google-ads"]');
    if (!scope) return;

    requestAnimationFrame(() => scope.classList.add('show'));
    await bindFeatureToggle(scope, FEATURE_KEYS.GOOGLE_AD_WARN);

    // detect toggle state
    const toggleBtn = scope.querySelector('[data-ob-toggle="feature_google_ad_warn_enabled"]');

    // Keep all ad warning feature flags in sync with this single toggle
    async function syncAllAdsFlagsFromToggle() {
      const enabled = toggleBtn.classList.contains('on');
      await storage.set({
        [FEATURE_KEYS.GOOGLE_AD_WARN]: enabled,
        [FEATURE_KEYS.COINGECKO_AD_WARN]: enabled,
        [FEATURE_KEYS.DEXTOOLS_AD_WARN]: enabled,
        [FEATURE_KEYS.DEXSCREENER_AD_WARN]: enabled,
      });
    }

    function applyAdVisibility() {
      const enabled = toggleBtn.classList.contains('on');
      const ads = scope.querySelectorAll('.search-result.ad');

      ads.forEach((ad) => {
        if (enabled) {
          ad.classList.remove('as-organic');
          ad.classList.add('malicious');
          const label = ad.querySelector('.ad-label');
          if (label) label.style.display = '';
        } else {
          ad.classList.remove('malicious');
          ad.classList.add('as-organic'); // make it look exactly like organic result
          const label = ad.querySelector('.ad-label');
          if (label) label.style.display = 'none';
        }
      });
    }

    // apply initial state
    applyAdVisibility();
    // and mirror to all ad platforms on first load
    await syncAllAdsFlagsFromToggle();

    // update whenever toggled
    toggleBtn.addEventListener('click', () => {
      // allow bindFeatureToggle to flip classes, then sync UI + storage
      setTimeout(() => {
        applyAdVisibility();
        syncAllAdsFlagsFromToggle();
      }, 50);
    });

    // animation trigger for "THE TRAP" and "YOUR PROTECTION"
    const onAnimStart = (e) => {
      if (!(e.target instanceof HTMLElement)) return;
      if (
        e.animationName === 'gaRise' &&
        e.target.matches('.panel-right .panel-right-content .info-block:nth-child(2)')
      ) {
        scope.classList.add('phase-3');
        scope.removeEventListener('animationstart', onAnimStart, true);
      }
    };
    scope.addEventListener('animationstart', onAnimStart, true);
  },

  antiphish: async () => {
    const scope = root.querySelector('[data-step="antiphish"]');
    if (!scope) return;
    requestAnimationFrame(() => scope.classList.add('show'));
    await bindFeatureToggle(scope, FEATURE_KEYS.ANTIPHISH);
    // Force default ON for this feature during onboarding
    try {
      const btn = scope.querySelector('[data-ob-toggle="feature_antiphish_enabled"]');
      const data = await storage.get([FEATURE_KEYS.ANTIPHISH]);
      const enabled = data[FEATURE_KEYS.ANTIPHISH];
      if (enabled !== true) {
        btn?.classList.add('on');
        await storage.set({ [FEATURE_KEYS.ANTIPHISH]: true });
      }
    } catch (_) {}
  },

  coverage: async () => {
    await initStepWithToggle('coverage', FEATURE_KEYS.COVERAGE);

    const step = root.querySelector('[data-step="coverage"]');
    if (!step) return;

    // Ensure tweet avatars show the first letter of the name
    try {
      const tweetCards = Array.from(step.querySelectorAll('#cov-tweet-feed .tweet-card'));
      const palette = ['#60a5fa', '#f59e0b', '#34d399', '#f472b6', '#a78bfa', '#f87171', '#22d3ee'];
      tweetCards.forEach((card) => {
        const nameEl = card.querySelector('.tweet-name');
        const headerEl = card.querySelector('.tweet-hd');
        if (!nameEl || !headerEl) return;
        const name = (nameEl.textContent || '').trim();
        const initial = (name[0] || '?').toUpperCase();
        let avatar = card.querySelector('.tweet-avatar');
        if (!avatar) {
          avatar = document.createElement('div');
          avatar.className = 'tweet-avatar';
          headerEl.prepend(avatar);
        }
        avatar.textContent = initial;
        // deterministic color choice
        const idx = ((name.charCodeAt(0) || 0) + name.length) % palette.length;
        const base = palette[idx];
        avatar.style.background = `radial-gradient(120% 120% at 30% 30%, ${base} 0%, #1f2937 100%)`;
        avatar.style.color = '#ffffff';
      });
    } catch (_) {}

    const amountEl = step.querySelector('#coverage-amount');
    const subtitleEl = step.querySelector('#coverage-subtitle');
    const coverageSubtitleOn = t('onboarding.coverage.subtitle');
    const coverageSubtitleOff = t('onboarding.coverage.subtitle_off');
    const walletBalanceText = t('onboarding.coverage.wallet_balance');

    let toggleBtn = step.querySelector('[data-ob-toggle="feature_coverage_enabled"]');
    const modal = document.getElementById('coverage-confirm');
    const btnCancel = step.querySelector('#cov-keep-enabled') || document.querySelector('#cov-keep-enabled');
    const btnConfirm = step.querySelector('#cov-disable-confirm') || document.querySelector('#cov-disable-confirm');
    const btnCloseX = step.querySelector('.cov-close') || document.querySelector('.cov-close');

    const parseDollar = (txt) => Number(String(txt || '').replace(/[^0-9]/g, '')) || 0;

    function animateCoverageAmountDir(el, from, to, duration, nextPhase, opts) {
      const start = performance.now();
      const increasing = to > from;

      function frame(now) {
        const p = Math.min((now - start) / duration, 1);
        const val = Math.floor(from + (to - from) * p);
        el.textContent = '$' + val.toLocaleString();

        // subtitle override during animation
        if (opts?.subtitleDuring && subtitleEl) {
          subtitleEl.textContent = opts.subtitleDuring;
          if (opts?.subtitleColor) subtitleEl.style.color = opts.subtitleColor;
        }

        // color logic
        if (opts?.colorMode === 'drainRed') {
          el.style.color = '#ff5252';
        } else if (opts?.colorMode === 'refillGreen') {
          el.style.color = '#00ff88';
        } else {
          // default legacy behavior
          if (val <= 0) {
            el.style.color = '#9aa3ad';
            if (subtitleEl) subtitleEl.textContent = coverageSubtitleOff;
          } else {
            el.style.color = '#00ff88';
            if (subtitleEl) subtitleEl.textContent = coverageSubtitleOn;
          }
        }

        if (p < 1) {
          requestAnimationFrame(frame);
        } else {
          el.textContent = '$' + to.toLocaleString();
          if (opts?.colorMode === 'drainRed') {
            el.style.color = '#ff5252';
          } else if (opts?.colorMode === 'refillGreen') {
            el.style.color = '#00ff88';
          } else {
            el.style.color = to <= 0 ? '#9aa3ad' : '#00ff88';
          }
          if (subtitleEl) {
            if (opts?.setFinalSubtitle) {
              subtitleEl.textContent = opts.setFinalSubtitle;
              if (opts?.setFinalSubtitleColor) subtitleEl.style.color = opts.setFinalSubtitleColor;
            } else {
              subtitleEl.textContent = to <= 0 ? coverageSubtitleOff : coverageSubtitleOn;
              subtitleEl.style.color = '#cfd3d7';
            }
          }
          if (typeof nextPhase === 'function') nextPhase();
        }
      }
      requestAnimationFrame(frame);
    }

    // --- New staged intro sequence (4 phases) ---
    const riskBlock = step.querySelector('.panel-right .panel-right-content .info-block:nth-child(2)');
    const safetyBlock = step.querySelector('.panel-right .panel-right-content .info-block:nth-child(3)');
    const leftItems = Array.from(step.querySelectorAll('.panel-left .coverage-item'));
    const leftLabel = step.querySelector('.panel-left .section-label');
    const toggleWrap = step.querySelector('.toggle-wrapper');
    const toggleSub = step.querySelector('.toggle-subtext');
    const badges = Array.from(step.querySelectorAll('.panel-left .coverage-badge'));

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const showWithTransition = (el, dur = 600) => {
      if (!el) return Promise.resolve();
      el.style.transition = `opacity ${dur}ms ease, transform ${dur}ms ease`;
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.visibility = 'visible';
      return sleep(dur);
    };
    const hideInstant = (el) => {
      if (!el) return;
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      el.style.visibility = 'hidden';
    };
    const setCoveredBadgesVisible = (visible) => {
      badges.forEach((b) => {
        if (visible) {
          b.classList.add('show');
          b.style.opacity = '1';
          b.style.transform = 'none';
          b.style.visibility = 'visible';
        } else {
          b.classList.remove('show');
          b.style.opacity = '0';
          b.style.transform = 'translateY(8px)';
          b.style.visibility = 'hidden';
        }
      });
    };
    const animateAmountP = (from, to, dur, opts) =>
      new Promise((resolve) => animateCoverageAmountDir(amountEl, from, to, dur, resolve, opts));

    // Set initial visual state for sequence: only $30,000 visible
    const primeInitial = () => {
      amountEl.textContent = '$30,000';
      amountEl.style.color = '#00ff88';
      if (subtitleEl) subtitleEl.textContent = coverageSubtitleOn;

      // Do not hide the toggle row or fee text; keep them visible at all times
      [riskBlock, safetyBlock, leftLabel, ...leftItems, ...badges].forEach(hideInstant);
    };

    async function runSequence() {
      const GAP = 800; // ms between phases
      const APPEAR_DUR = 600; // ms for fade/slide in
      const DRAIN_DUR = 1600; // keep existing drain duration
      const REFILL_DUR = 1000;

      // 1) Only $30,000 on screen
      primeInitial();
      // give the overall step a moment to settle, then pause
      await sleep(GAP);

      // 2) Show "THE RISK" + left panel (all three at once)
      await Promise.all([
        showWithTransition(riskBlock, APPEAR_DUR),
        showWithTransition(leftLabel, APPEAR_DUR),
        ...leftItems.map((it) => showWithTransition(it, APPEAR_DUR)),
      ]);
      await sleep(GAP);

      // 3) Coverage drains to $0
      await animateAmountP(30000, 0, DRAIN_DUR, {
        colorMode: 'drainRed',
        subtitleDuring: walletBalanceText,
        subtitleColor: '#ff5252',
        setFinalSubtitle: walletBalanceText,
        setFinalSubtitleColor: '#ff5252',
      });
      await sleep(GAP);

      // 4) Show "YOUR SAFETY NET" and refill to $30,000
      const refillP = animateAmountP(0, 30000, REFILL_DUR, {
        colorMode: 'refillGreen',
        subtitleDuring: walletBalanceText,
        subtitleColor: '#ff5252',
        setFinalSubtitle: coverageSubtitleOn,
        setFinalSubtitleColor: '#cfd3d7',
      }); // start refill
      const safetyRevealP = showWithTransition(safetyBlock, APPEAR_DUR); // kick off reveal immediately
      // Reveal COVERED badges only if coverage is toggled ON
      if (toggleBtn?.classList.contains('on')) {
        badges.forEach((b) => {
          b.style.transition = 'opacity 300ms ease, transform 300ms ease';
          b.style.opacity = '1';
          b.style.transform = 'none';
          b.style.visibility = 'visible';
          b.classList.add('show');
        });
      } else {
        setCoveredBadgesVisible(false);
      }
      await Promise.all([refillP, safetyRevealP]); // ensure both finish before moving on

      // toggle row and fee text remain visible the whole time (no staged reveal)
    }

    // Kickoff sequence once the step is "ready"
    if (step.classList.contains('ready')) {
      runSequence();
    } else {
      const mo = new MutationObserver(() => {
        if (step.classList.contains('ready')) {
          mo.disconnect();
          runSequence();
        }
      });
      mo.observe(step, { attributes: true, attributeFilter: ['class'] });
    }

    const clone = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(clone, toggleBtn);
    toggleBtn = clone;

    function openModal() {
      modal?.classList.add('active');
      modal?.setAttribute('aria-hidden', 'false');
    }
    function closeModal() {
      modal?.classList.remove('active');
      modal?.setAttribute('aria-hidden', 'true');
    }

    toggleBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOn = toggleBtn.classList.contains('on');

      if (isOn) {
        openModal();
      } else {
        const current = parseDollar(amountEl.textContent);
        animateCoverageAmountDir(amountEl, current, 30000, 700);
        toggleBtn.classList.add('on');
        setCoveredBadgesVisible(true);
        await storage.set({ [FEATURE_KEYS.COVERAGE]: true });
      }
    });

    btnCancel?.addEventListener('click', () => closeModal());
    btnCloseX?.addEventListener('click', () => closeModal());

    btnConfirm?.addEventListener('click', async () => {
      const current = parseDollar(amountEl.textContent);
      animateCoverageAmountDir(amountEl, current, 0, 600);
      toggleBtn.classList.remove('on');
      setCoveredBadgesVisible(false);
      await storage.set({ [FEATURE_KEYS.COVERAGE]: false });
      closeModal();
    });
  },

  'experimental-features': async () => {
    const scope = root.querySelector('[data-step="experimental-features"]');
    if (!scope) return;

    const tabs = Array.from(scope.querySelectorAll('.ef-tab'));
    const screens = Array.from(scope.querySelectorAll('.feature-screen'));
    const nextBtn = scope.querySelector('[data-ob-action="next"]');
    const backBtn = scope.querySelector('[data-ob-action="back"]');

    let idx = 0;

    function show(i) {
      idx = Math.max(0, Math.min(i, screens.length - 1));

      tabs.forEach((t, k) => {
        const active = k === idx;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });

      screens.forEach((s, k) => s.classList.toggle('active', k === idx));

      const screen = screens[idx];
      screen.classList.add('sequence-v2');
      screen.classList.remove('ready'); // reset if revisiting
      screen.getBoundingClientRect(); // reflow to restart animations
      requestAnimationFrame(() => screen.classList.add('ready'));

      if (nextBtn) nextBtn.textContent = idx === screens.length - 1 ? 'Finish' : 'Next';
    }

    tabs.forEach((t, k) => t.addEventListener('click', () => show(k)));

    if (backBtn)
      backBtn.addEventListener('click', (e) => {
        if (idx > 0) {
          e.stopPropagation();
          show(idx - 1);
        }
      });

    if (nextBtn)
      nextBtn.addEventListener('click', (e) => {
        if (idx < screens.length - 1) {
          e.stopPropagation();
          show(idx + 1);
        }
      });

    await bindFeatureToggle(scope, FEATURE_KEYS.X_OP_DETECTOR);
    await bindFeatureToggle(scope, FEATURE_KEYS.ETHOS_SCORE);
    // await bindFeatureToggle(scope, FEATURE_KEYS.ADDRESS_GUARD);
    // Slow Mode (Hold to Confirm) — default OFF
    await bindFeatureToggle(scope, FEATURE_KEYS.SLOWMODE, false);

    const holdBtn = scope.querySelector('.ef-hold-btn');
    if (holdBtn) {
      let holdTimer,
        holding = false;
      const progress = holdBtn.querySelector('.ef-hold-progress');
      const label = holdBtn.querySelector('.ef-hold-text');
      const seconds = Number(holdBtn.dataset.hold || 3);

      const reset = () => {
        holdBtn.classList.remove('confirmed', 'holding');
        progress.style.transition = 'none';
        progress.style.width = '0';
        requestAnimationFrame(() => (progress.style.transition = ''));
        label.textContent = `Hold for ${seconds} seconds to confirm`;
      };
      const start = () => {
        if (holdBtn.classList.contains('confirmed')) return;
        holding = true;
        holdBtn.classList.add('holding');
        progress.style.transition = `width ${seconds}s linear`;
        progress.style.width = '100%';
        holdTimer = setTimeout(() => {
          if (!holding) return;
          holdBtn.classList.remove('holding');
          holdBtn.classList.add('confirmed');
          label.textContent = t('onboarding.experimental.hold.connected');
          progress.style.width = '100%';
          setTimeout(reset, 1200);
        }, seconds * 1000);
      };
      const stop = () => {
        holding = false;
        holdBtn.classList.remove('holding');
        progress.style.transition = 'none';
        progress.style.width = '0';
        clearTimeout(holdTimer);
        requestAnimationFrame(() => (progress.style.transition = ''));
      };

      holdBtn.addEventListener('mousedown', start);
      holdBtn.addEventListener('touchstart', start, { passive: true });
      ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach((ev) => holdBtn.addEventListener(ev, stop));
    }

    show(0);
  },
};
