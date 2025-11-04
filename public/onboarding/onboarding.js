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

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(from + (to - from) * progress);
    el.textContent = '$' + value.toLocaleString();

    // color lerp: red (255,82,82) → green (0,255,136)
    const r = Math.round(255 - 255 * progress);
    const g = Math.round(82 + (255 - 82) * progress);
    const b = Math.round(82 + (136 - 82) * progress);
    el.style.color = `rgb(${r},${g},${b})`;

    if (progress < 1) requestAnimationFrame(frame);
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
  if (id === 'google-ads') {
    const step = document.querySelector('[data-step="google-ads"]');
    if (!step) return;
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

  const data = await storage.get([key]);
  let enabled = data[key];

  if (typeof enabled === 'undefined') {
    enabled = true; // default ON
    await storage.set({ [key]: true }); // persist it
  }

  btn.classList.toggle('on', enabled);

  btn.addEventListener('click', async () => {
    const next = !btn.classList.contains('on');
    btn.classList.toggle('on', next);
    await storage.set({ [key]: next });
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

      const previewCard = preview; // #sim-preview
      const siteIcon = scope.querySelector('.sim-site-icon');
      const siteName = el.site;

      const flowItems = Array.from(scope.querySelectorAll('.sim-flow-item'));
      const labelSend = flowItems[0].querySelector('.sim-flow-label');
      const labelSecond = flowItems[1].querySelector('.sim-flow-label');
      const amtSend = el.sendAmt;
      const tokSend = el.sendTok;
      const amtRecv = el.recvAmt;
      const tokRecv = el.recvTok;

      previewCard.classList.remove('critical');
      el.critical.style.display = 'none';
      el.critical.classList.remove('show');
      labelSend.textContent = 'You send';
      labelSecond.textContent = 'You receive';
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
      confirmBtn.textContent = 'CONFIRM';

      if (i === 0) {
        amtSend.textContent = '-1.5';
        tokSend.textContent = 'ETH';
        amtRecv.textContent = '+3,847';
        tokRecv.textContent = 'USDC';
        el.fee.textContent = '~$8.42';
      } else if (i === 1) {
        amtSend.textContent = '-1.5';
        tokSend.textContent = 'ETH';
        amtRecv.textContent = '+3,846';
        tokRecv.textContent = 'USDC';
        el.fee.textContent = '~$58.10';
      } else {
        labelSecond.textContent = 'You send';
        amtSend.textContent = '-2.8';
        tokSend.textContent = 'WETH';
        amtRecv.textContent = '-8,450';
        tokRecv.textContent = 'MOG';

        amtRecv.classList.remove('in');
        amtRecv.classList.add('out');
        tokRecv.classList.add('fake');

        previewCard.classList.add('critical');
        // el.critical.style.display = '';
        requestAnimationFrame(() => el.critical.classList.add('show'));

        confirmBtn.classList.add('danger');
        confirmBtn.textContent = 'PROCEED ANYWAY';

        el.fee.textContent = '~$9.10';
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

    const scope = root.querySelector('[data-step="coverage"]');
    if (!scope) return;

    const amountEl = scope.querySelector('#coverage-amount');
    if (!amountEl) return;

    amountEl.textContent = '$0';
    amountEl.style.color = '#ff5252';

    setTimeout(() => {
      animateCoverageAmount(amountEl, 0, 30000, 1800);
    }, 2300);
  },
};
