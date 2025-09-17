export type AdapterKind = 'UR' | 'SMART' | 'NONE';

export interface AdaptParams {
  tx: { to: string; data: string; from?: string; gas?: string };
  chainId: number;
  feeRecipient: string;
  feeBps: number;
  options: {
    strictEstimate?: boolean;
    ownerExtrasLower?: string[];
  };
}

export interface AdaptResult {
  data?: string; // if provided, replace tx.data
  note?: string; // log message
}

export interface RouterAdapter {
  kind: AdapterKind;
  detect: (tx: { to?: string; data?: string }, chainId: number) => boolean;
  adapt: (p: AdaptParams) => Promise<AdaptResult | null>;
}

import { universalRouterAdapter } from './universal-router';

export const ADAPTERS: RouterAdapter[] = [universalRouterAdapter];

export function pickAdapter(tx: any, chainId: number): RouterAdapter | null {
  for (const a of ADAPTERS) {
    if (a.detect(tx, chainId)) return a;
  }
  return null;
}
