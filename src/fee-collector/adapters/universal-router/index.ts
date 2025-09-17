import { decodeExecute } from '../../shared/abi';
import { injectViaPayPortionSequential } from './strategies/payPortion';
import { injectViaReplaceEthSweepWithUnwrapAndTransfer } from './strategies/unwrapAndTransfer';
import { injectViaRewriteSwapBeforeUnwrapAndAppendFee } from './strategies/rewriteSwapBeforeUnwrap';
import { injectViaRewriteSwapAndAppendFee } from './strategies/rewriteSwapTail';
import { injectViaTransferFallback } from './strategies/transferFallback';
import { RouterAdapter, AdaptResult, AdaptParams } from '..';
import { EXECUTE2_SELECTOR, EXECUTE3_SELECTOR, ROUTERS_BY_CHAIN } from '../../../lib/constants';

const sigs = new Set([EXECUTE2_SELECTOR.toLowerCase(), EXECUTE3_SELECTOR.toLowerCase()]);

export const universalRouterAdapter: RouterAdapter = {
  kind: 'UR',
  detect(tx, chainId) {
    if (!tx?.to || !tx?.data) return false;
    const to = String(tx.to).toLowerCase();
    const sig = String(tx.data).slice(0, 10).toLowerCase();
    const allow = (ROUTERS_BY_CHAIN?.[chainId] ?? []).map((x: string) => x.toLowerCase());
    if (!sigs.has(sig)) return false;
    if (allow.length && !allow.includes(to)) return false;
    try {
      return !!decodeExecute(String(tx.data));
    } catch {
      return false;
    }
  },
  async adapt({ tx, chainId, feeRecipient, feeBps, options }: AdaptParams): Promise<AdaptResult | null> {
    const ownerExtrasLower = options.ownerExtrasLower ?? [];
    const seq = [
      () => injectViaPayPortionSequential(tx.data, feeRecipient, feeBps, ownerExtrasLower),
      () => injectViaReplaceEthSweepWithUnwrapAndTransfer(tx.data, feeRecipient, feeBps, ownerExtrasLower, chainId),
      () => injectViaRewriteSwapBeforeUnwrapAndAppendFee(tx.data, feeRecipient, feeBps, ownerExtrasLower, chainId),
      () => injectViaRewriteSwapAndAppendFee(tx.data, feeRecipient, feeBps, ownerExtrasLower),
      () => injectViaTransferFallback(tx.data, feeRecipient, feeBps, ownerExtrasLower),
    ];
    for (const step of seq) {
      const r = step();
      if (r?.data) return { data: r.data };
    }
    return null;
  },
};
