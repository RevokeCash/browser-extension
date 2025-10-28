export const KEYS = {
  hasOnboarded: 'ob_hasOnboarded',
  dismissed: 'ob_dismissed',
};

const api = chrome?.storage?.local ?? browser.storage.local;

export async function setState(patch) {
  await api.set(patch);
}

export async function getState(keys = KEYS) {
  return api.get(keys);
}
