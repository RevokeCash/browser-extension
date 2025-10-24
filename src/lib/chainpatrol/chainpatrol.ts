export type ChainPatrolStatus = 'SAFE' | 'BLOCKED' | 'UNKNOWN';

export type ChainPatrolResponse = {
  status?: string;
  verdict?: string;
  result?: { status?: string };
  reason?: string;
  category?: string;
  [k: string]: any;
};

export function extractOriginalFromMetaMaskWarning(u: string): string | null {
  try {
    const url = new URL(u);
    if (!/metamask\.github\.io$/i.test(url.hostname)) return null;
    if (!/phishing-warning/i.test(url.pathname)) return null;
    const hash = url.hash?.replace(/^#/, '') || '';
    const params = new URLSearchParams(hash);
    const hrefParam = params.get('href') || params.get('url') || params.get('link');
    return hrefParam ? decodeURIComponent(hrefParam) : null;
  } catch {
    return null;
  }
}

function toFullUrl(input: string): string {
  try {
    new URL(input);
    return input;
  } catch {
    return `https://${input}`;
  }
}

function mapStatus(res: ChainPatrolResponse): ChainPatrolStatus {
  const raw = res?.status ?? res?.verdict ?? res?.result?.status ?? '';
  const s = typeof raw === 'string' ? raw.toUpperCase() : '';

  if (s === 'BLOCKED') return 'BLOCKED';
  if (s === 'SAFE' || s === 'ALLOWED') return 'SAFE';
  return 'UNKNOWN';
}

export async function checkUrlFull(url: string, apiKey: string): Promise<ChainPatrolStatus> {
  const recovered = extractOriginalFromMetaMaskWarning(url);
  const toCheck = toFullUrl(recovered || url);

  const res = await fetch('https://app.chainpatrol.io/api/v2/asset/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify({ type: 'URL', content: toCheck }),
  });

  if (!res.ok) return 'UNKNOWN';

  const data = (await res.json()) as ChainPatrolResponse;
  return mapStatus(data);
}

export function toCaip2(chainId?: string | number, addr?: string) {
  if (!addr) return '';
  const c = Number(chainId);
  const clean = addr.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(clean)) return '';
  if (!Number.isFinite(c) || c <= 0) return '';
  return `eip155:${c}:${clean}`;
}

export async function checkAsset(content: string, apiKey: string, signal?: AbortSignal): Promise<ChainPatrolResponse> {
  if (!content) return { status: 'UNKNOWN' };

  const r = await fetch('https://app.chainpatrol.io/api/v2/asset/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify({ content }),
    signal,
  });

  if (!r.ok) return { status: 'UNKNOWN' };
  return (await r.json()) as ChainPatrolResponse;
}
