const root = document.getElementById('ob-root');

const STEP_ORDER = ['landing', 'watchlist', 'simulator', 'address-poisoning', 'google-ads', 'coverage', 'summary'];

const storage = chrome?.storage?.local ?? browser.storage.local;
const KEYS = { hasOnboarded: 'ob_hasOnboarded', dismissed: 'ob_dismissed' };

function stepUrl(step) {
  return chrome.runtime.getURL(`onboarding/steps/${step}.html`);
}

function currentStep() {
  const h = location.hash.replace('#', '') || STEP_ORDER[0] || 'step';
  return STEP_ORDER.includes(h) ? h : STEP_ORDER[0];
}

async function loadStep(step) {
  const res = await fetch(stepUrl(step));
  const html = await res.text();
  root.innerHTML = html;

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
    const rootStep = document.querySelector('[data-step="watchlist"]');
    const yourBlock = rootStep?.querySelector('#wl-your-block');
    const alerts = rootStep?.querySelector('#wl-alerts');
    [yourBlock, alerts].forEach((el) => el?.classList.remove('show'));
    const revealNextPaint = (el) => {
      if (!el) return;
      el.getBoundingClientRect();
      requestAnimationFrame(() => el.classList.add('show'));
    };
    revealNextPaint(yourBlock);
    setTimeout(() => alerts?.classList.add('show'), 100);
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
  ADDRESS_GUARD: 'feature_address_guard_enabled',
  COVERAGE: 'feature_coverage_enabled',
};

async function bindFeatureToggle(scope, key) {
  if (!scope) return;
  const btn = scope.querySelector(`[data-ob-toggle="${key}"]`);
  if (!btn) return;

  const data = await storage.get(key);
  let enabled = !!data[key];
  btn.classList.toggle('on', enabled);

  btn.addEventListener('click', async () => {
    const next = !btn.classList.contains('on');
    btn.classList.toggle('on', next);
    await storage.set({ [key]: next });
    enabled = next;
  });
}

async function initStepWithToggle(step, key) {
  const scope = root.querySelector(`[data-step="${step}"]`);
  if (!scope) return;
  requestAnimationFrame(() => scope.classList.add('show'));
  await bindFeatureToggle(scope, key);
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

      if (i === 0) {
        el.site.textContent = 'Uniswap';
        el.sendAmt.textContent = '-1.5';
        el.sendTok.textContent = 'ETH';
        el.recvAmt.textContent = '+3,847';
        el.recvTok.textContent = 'USDC';
        el.fee.textContent = '~$8.42';
        el.critical.style.display = 'none';
      } else if (i === 1) {
        el.site.textContent = 'Uniswap';
        el.sendAmt.textContent = '-1.5';
        el.sendTok.textContent = 'ETH';
        el.recvAmt.textContent = '+3,846';
        el.recvTok.textContent = 'USDC';
        el.fee.textContent = '~$58.10';
        el.critical.style.display = 'none';
      } else {
        el.site.textContent = 'SketchySwap';
        el.sendAmt.textContent = '-1.5';
        el.sendTok.textContent = 'ETH';
        el.recvAmt.textContent = '+0';
        el.recvTok.textContent = 'USDC';
        el.fee.textContent = '~$9.10';
        el.critical.style.display = '';
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
    const scope = root.querySelector('[data-step="address-poisoning"]');
    if (!scope) return;

    const rows = Array.from(scope.querySelectorAll('.tx-item[data-poison="true"]'));
    rows.forEach((r) => r.querySelector('.poison-badge')?.removeAttribute('style'));
    rows.forEach((r) => r.querySelector('.poison-badge')?.classList.remove('show'));
    setTimeout(() => {
      rows.forEach((r) => r.querySelector('.poison-badge')?.classList.add('show'));
      rows.forEach((r) => r.classList.add('blink'));
      setTimeout(() => rows.forEach((r) => r.classList.remove('blink')), 850);
    }, 120);

    await bindFeatureToggle(scope, FEATURE_KEYS.ADDRESS_GUARD);
  },

  'google-ads': async () => {
    const scope = root.querySelector('[data-step="google-ads"]');
    if (!scope) return;
    requestAnimationFrame(() => scope.classList.add('show'));
    await bindFeatureToggle(scope, FEATURE_KEYS.GOOGLE_AD_WARN);
  },

  coverage: async () => {
    await initStepWithToggle('coverage', FEATURE_KEYS.COVERAGE);
  },
};
