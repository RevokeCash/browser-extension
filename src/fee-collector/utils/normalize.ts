export const toLower = (s: any) => String(s ?? '').toLowerCase();

export const normalizeSet = (s: any): Set<string> => {
  if (!s) return new Set();
  if (s instanceof Set) return new Set([...s].map(toLower));
  if (Array.isArray(s)) return new Set(s.map(toLower));
  return new Set();
};
