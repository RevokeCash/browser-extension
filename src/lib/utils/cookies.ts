// Lightweight cookie helpers for extension pages
const STORAGE_PREFIX = '__cx_cookie__:';

export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie?.split('; ').find((row) => row.startsWith(`${encodeURIComponent(name)}=`));
  if (!match) return undefined;
  const value = match.split('=')[1];
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === 'undefined') return;
  const encodedName = encodeURIComponent(name);
  const encodedValue = encodeURIComponent(value);
  const parts = [
    `${encodedName}=${encodedValue}`,
    `Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`,
    'Path=/',
    'SameSite=Lax',
  ];
  // "Secure" is harmless on extension pages, but some browsers may ignore it; safe to include
  parts.push('Secure');
  document.cookie = parts.join('; ');

  // Fallback for extension pages where document.cookie may not persist
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${name}`, value);
  } catch {}
}

export function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=/; SameSite=Lax; Secure`;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${name}`);
  } catch {}
}

export function getJsonCookie<T>(name: string): T | undefined {
  const raw = getCookie(name);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Try localStorage fallback
    try {
      const ls = localStorage.getItem(`${STORAGE_PREFIX}${name}`);
      if (!ls) return undefined;
      return JSON.parse(ls) as T;
    } catch {
      return undefined;
    }
  }
}

export function setJsonCookie(name: string, value: unknown, maxAgeSeconds: number) {
  try {
    const raw = JSON.stringify(value);
    setCookie(name, raw, maxAgeSeconds);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${name}`, raw);
    } catch {}
  } catch {
    // Swallow JSON errors
  }
}
