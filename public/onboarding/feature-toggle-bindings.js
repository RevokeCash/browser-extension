// onboarding/feature-toggle-bindings.js
// Wires onboarding step toggles to real extension feature flags.

// Optional: if you want analytics, uncomment the next line and ensure the path is correct
// import { logConfigChange } from '../../logs/extensionLogs.js';

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

const storage = chrome?.storage?.local ?? browser.storage.local;

/**
 * Read current boolean from storage, reflect in UI, then persist on click.
 * @param {Element} scope - root element of the step (e.g. [data-step="simulator"])
 * @param {string} selector - CSS selector for the toggle button inside scope
 * @param {string} key - storage key from FEATURE_KEYS
 * @param {(prev:boolean, next:boolean)=>Promise<void>|void} [onChange] - optional side-effect (e.g. analytics)
 */
export async function bindFeatureToggle(scope, selector, key, onChange) {
  const btn = scope.querySelector(selector);
  if (!btn) return;

  // Load current setting
  const data = await storage.get(key);
  let enabled = !!data[key];
  btn.classList.toggle('on', enabled);

  // Persist on click
  btn.addEventListener('click', async () => {
    const next = !btn.classList.contains('on');
    btn.classList.toggle('on', next);
    await storage.set({ [key]: next });

    try {
      // Optional analytics hook
      if (typeof onChange === 'function') await onChange(enabled, next);

      // If you want to use your existing logger, uncomment below:
      // const { fs_last_user_address } = await storage.get('fs_last_user_address');
      // await logConfigChange(fs_last_user_address, {
      //   url: location.href,
      //   configKey: key,
      //   previousValue: enabled,
      //   newValue: next,
      // });
    } catch {
      /* non-blocking */
    }

    enabled = next;
  });
}

/**
 * Step initializers that:
 *  - add the .show class (so your fade-in CSS triggers),
 *  - bind each toggle to FEATURE_KEYS.
 * Merge this with your existing stepInits.
 */
export const featureStepInits = {
  //   async simulator(root) {
  //     const scope = root.querySelector('[data-step="simulator"]');
  //     if (!scope) return;
  //     requestAnimationFrame(() => scope.classList.add('show'));
  //     await bindFeatureToggle(scope, '#sim-toggle', FEATURE_KEYS.SIMULATOR);
  //   },

  async 'address-poisoning'(root) {
    const scope = root.querySelector('[data-step="address-poisoning"]');
    if (!scope) return;
    requestAnimationFrame(() => scope.classList.add('show'));
    await bindFeatureToggle(scope, '#poison-toggle', FEATURE_KEYS.ADDRESS_GUARD);
  },

  async 'google-ads'(root) {
    const scope = root.querySelector('[data-step="google-ads"]');
    if (!scope) return;
    requestAnimationFrame(() => scope.classList.add('show'));
    await bindFeatureToggle(scope, '#ads-toggle', FEATURE_KEYS.GOOGLE_AD_WARN);
    // If you later add per-platform toggles, bind FEATURE_KEYS.COINGECKO_AD_WARN / DEXTOOLS_AD_WARN / DEXSCREENER_AD_WARN here too.
  },

  async coverage(root) {
    const scope = root.querySelector('[data-step="coverage"]');
    if (!scope) return;
    requestAnimationFrame(() => scope.classList.add('show'));
    await bindFeatureToggle(scope, '#coverage-toggle', FEATURE_KEYS.COVERAGE);
  },
};
