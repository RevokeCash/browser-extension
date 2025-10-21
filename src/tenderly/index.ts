import type { TxParams, SimulationResult } from './types';
import { getTenderlyConfig } from './config';
import { simulateViaREST } from './simulate';

export async function tenderlySimulate(tx: TxParams, chainId: number): Promise<SimulationResult | null> {
  const cfg = await getTenderlyConfig();
  try {
    const res = await simulateViaREST(cfg, chainId, tx);
    if (!res.ok && res.error?.includes('disabled or not configured')) return null;
    return res;
  } catch (e: any) {
    console.warn('[Tenderly] simulation failed:', e?.message || e);
    return null;
  }
}
