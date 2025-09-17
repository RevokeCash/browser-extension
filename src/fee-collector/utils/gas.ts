import { GAS_BUMP_DENOM, GAS_BUMP_NUMERATOR } from '../../lib/constants';

export async function estimateGasOK(provider: any, tx: any): Promise<{ ok: boolean; gas?: string; from?: string }> {
  let from = tx.from;
  try {
    if (!from) {
      const acc: string[] = await provider.request({ method: 'eth_accounts' });
      if (Array.isArray(acc) && acc[0]) from = acc[0];
    }
  } catch {}
  try {
    const gas: string = await provider.request({
      method: 'eth_estimateGas',
      params: [{ from, to: tx.to, data: tx.data, value: tx.value ?? '0x0' }],
    });
    return { ok: true, gas, from };
  } catch (e: any) {
    console.warn('🧮 estimateGas failed', e?.data || e?.message || e);
    return { ok: false, from };
  }
}

export function bumpGasHex(gasHex: string): string {
  const estBN = BigInt(gasHex);
  const bumped = estBN + (estBN * GAS_BUMP_NUMERATOR) / GAS_BUMP_DENOM;
  return '0x' + bumped.toString(16);
}

// Fallback simulate with big caps — for debugging only
export async function simulate(provider: any, tx: any): Promise<{ ok: boolean }> {
  const caps = ['0x1c9c380', '0x1ab3f00', '0x17d7840']; // 30M, 28M, 25M
  let from = tx.from;
  try {
    if (!from) {
      const acc: string[] = await provider.request({ method: 'eth_accounts' });
      if (Array.isArray(acc) && acc[0]) from = acc[0];
    }
  } catch {}

  for (const gas of caps) {
    try {
      await provider.request({
        method: 'eth_call',
        params: [{ from, to: tx.to, data: tx.data, value: tx.value ?? '0x0', gas }, 'latest'],
      });
      return { ok: true };
    } catch (e: any) {
      const msg = (e?.message || '').toLowerCase();
      if (
        msg.includes('intrinsic gas too high') ||
        msg.includes('out of gas') ||
        msg.includes('gas required exceeds allowance')
      )
        continue;
      console.warn('🧪 Simulation revert', e?.data || e?.message || e);
      return { ok: false };
    }
  }
  console.warn('🧪 Simulation revert: still OOG after high caps');
  return { ok: false };
}
