import { ethers } from 'ethers';

export const clampBps = (x: number) => {
  const n = Math.floor(x ?? 0);
  return n < 0 ? 0 : n > 10000 ? 10000 : n;
};

// Sequential floors (critical for 6-dec tokens like USDC)
export const applyBpsSequential = (v: any, bpsList: number[]) => {
  let x = ethers.BigNumber.from(v);
  for (const b of bpsList) {
    const nb = Math.max(0, Math.min(10000, Math.floor(b)));
    x = x.mul(10000 - nb).div(10000);
  }
  return x;
};

// Our fee in the sequential model (before-after)
export const seqDelta = (amount: any, beforeBpsList: number[], ourBps: number) => {
  const before = applyBpsSequential(amount, beforeBpsList);
  const after = applyBpsSequential(amount, [...beforeBpsList, ourBps]);
  return before.sub(after);
};
