const root = document.getElementById('ob-root');

const STEP_ORDER = [
  'landing',
  'watchlist',
  'simulator',
  'address-poisoning',
  'google-ads',
  'coverage',
  'experimental-features',
  'summary',
];
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
        siteName.textContent = 'Uniswap';
        amtSend.textContent = '-1.5';
        tokSend.textContent = 'ETH';
        amtRecv.textContent = '+1.5';
        tokRecv.textContent = 'ETH';
        el.fee.textContent = '~$8.42';
      } else if (i === 1) {
        siteName.textContent = 'Unknown Site';
        labelSecond.textContent = 'You send';
        amtSend.textContent = '-2.8';
        tokSend.textContent = 'WETH';
        amtRecv.textContent = '-8,450';
        tokRecv.textContent = 'LINK';

        amtRecv.classList.remove('in');
        amtRecv.classList.add('out');
        tokRecv.classList.add('fake');

        previewCard.classList.add('critical');
        // el.critical.style.display = '';
        requestAnimationFrame(() => el.critical.classList.add('show'));

        confirmBtn.classList.add('danger');
        confirmBtn.textContent = 'PROCEED ANYWAY';

        el.fee.textContent = '~$9.10';
      } else {
        siteName.textContent = 'Aave';
        amtSend.textContent = '-3,846';
        tokSend.textContent = 'AUSDC';
        amtRecv.textContent = '+3,846';
        tokRecv.textContent = 'AUSDC';
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

    const rowsPoison = Array.from(step.querySelectorAll('.tx-item[data-poison="true"]'));
    const allCharDiffs = Array.from(step.querySelectorAll('.tx-hash .char-diff'));

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

    setTimeout(
      () => {
        step.classList.add('phase-2');
        rowsPoison.forEach((row) => {
          row.classList.add('poison');
          const label = row.querySelector('.tx-label');
          if (label) {
            label.classList.remove('received', 'you-send');
            label.classList.add('scammer');
            label.textContent = 'SCAMMER';
          }
        });
      },
      Math.max(0, phase2At + 30),
    );

    // ----- Phase 3: show circles and reveal the POISON pills
    setTimeout(
      () => {
        step.classList.add('phase-3');
        allCharDiffs.forEach((el) => el.classList.add('show-circle'));
        step.querySelectorAll('.poison-badge').forEach((b) => b.classList.add('show'));
      },
      Math.max(0, phase3At + 30),
    );
  },

  'google-ads': async () => {
    const scope = root.querySelector('[data-step="google-ads"]');
    if (!scope) return;

    requestAnimationFrame(() => scope.classList.add('show'));
    await bindFeatureToggle(scope, FEATURE_KEYS.GOOGLE_AD_WARN);

    // detect toggle state
    const toggleBtn = scope.querySelector('[data-ob-toggle="feature_google_ad_warn_enabled"]');

    function applyAdVisibility() {
      const enabled = toggleBtn.classList.contains('on');
      const ads = scope.querySelectorAll('.search-result.ad');

      ads.forEach((ad) => {
        if (enabled) {
          ad.classList.add('malicious');
          const label = ad.querySelector('.ad-label');
          if (label) label.style.display = '';
        } else {
          ad.classList.remove('malicious');
          const label = ad.querySelector('.ad-label');
          if (label) label.style.display = 'none';
        }
      });
    }

    // apply initial state
    applyAdVisibility();

    // update whenever toggled
    toggleBtn.addEventListener('click', () => {
      setTimeout(applyAdVisibility, 50);
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

  coverage: async () => {
    await initStepWithToggle('coverage', FEATURE_KEYS.COVERAGE);

    const step = root.querySelector('[data-step="coverage"]');
    if (!step) return;

    const amountEl = step.querySelector('#coverage-amount');
    const subtitleEl = step.querySelector('#coverage-subtitle');

    let toggleBtn = step.querySelector('[data-ob-toggle="feature_coverage_enabled"]');
    const modal = document.getElementById('coverage-confirm');
    const btnCancel = step.querySelector('#cov-keep-enabled') || document.querySelector('#cov-keep-enabled');
    const btnConfirm = step.querySelector('#cov-disable-confirm') || document.querySelector('#cov-disable-confirm');
    const btnCloseX = step.querySelector('.cov-close') || document.querySelector('.cov-close');

    const parseDollar = (txt) => Number(String(txt || '').replace(/[^0-9]/g, '')) || 0;

    function animateCoverageAmountDir(el, from, to, duration, nextPhase) {
      const start = performance.now();
      const increasing = to > from;

      function frame(now) {
        const p = Math.min((now - start) / duration, 1);
        const val = Math.floor(from + (to - from) * p);
        el.textContent = '$' + val.toLocaleString();

        // color logic: grey when 0, green otherwise
        if (val <= 0) {
          el.style.color = '#9aa3ad';
          if (subtitleEl) subtitleEl.textContent = 'NO COVERAGE';
        } else {
          el.style.color = '#00ff88';
          if (subtitleEl) subtitleEl.textContent = 'MAX COVERAGE PER USER';
        }

        if (p < 1) {
          requestAnimationFrame(frame);
        } else {
          el.textContent = '$' + to.toLocaleString();
          el.style.color = to <= 0 ? '#9aa3ad' : '#00ff88';
          if (subtitleEl) subtitleEl.textContent = to <= 0 ? 'NO COVERAGE' : 'MAX COVERAGE PER USER';
          if (typeof nextPhase === 'function') nextPhase();
        }
      }
      requestAnimationFrame(frame);
    }

    amountEl.textContent = '$0';
    amountEl.style.color = 'grey';

    const riskBlock = step.querySelector('.panel-right .panel-right-content .info-block:nth-child(2)');
    const toMs = (v) => (/\bms\b/i.test(v) ? parseFloat(v) : parseFloat(v || '0') * 1000);
    const armStart = () => {
      const enabled = toggleBtn.classList.contains('on');
      const cs = riskBlock ? getComputedStyle(riskBlock) : null;
      const delay = cs ? toMs((cs.animationDelay || '0s').split(',')[0]) : 0;

      setTimeout(
        () => {
          if (enabled) {
            // animate 30k → 0 → 30k
            animateCoverageAmountDir(amountEl, 30000, 0, 1600, () => {
              setTimeout(() => animateCoverageAmountDir(amountEl, 0, 30000, 1000), 1000);
            });
          } else {
            amountEl.textContent = '$0';
            amountEl.style.color = '#9aa3ad';
          }
        },
        Math.max(0, delay + 30),
      );
    };

    if (step.classList.contains('ready')) armStart();
    else {
      const mo = new MutationObserver(() => {
        if (step.classList.contains('ready')) {
          mo.disconnect();
          armStart();
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
        await storage.set({ [FEATURE_KEYS.COVERAGE]: true });
      }
    });

    btnCancel?.addEventListener('click', () => closeModal());
    btnCloseX?.addEventListener('click', () => closeModal());

    btnConfirm?.addEventListener('click', async () => {
      const current = parseDollar(amountEl.textContent);
      animateCoverageAmountDir(amountEl, current, 0, 600);
      toggleBtn.classList.remove('on');
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
          label.textContent = '✓ Connected Successfully';
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
