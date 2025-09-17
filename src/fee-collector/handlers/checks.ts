import { ethers } from 'ethers';
import { applyBpsSequential } from '../utils/math';
import { enc, padAddr, to32 } from '../utils/encoding';
import { CMD } from '../../lib/constants';

// Accept ONLY the proper BALANCE_CHECK_ERC20 opcode.
const BALANCE_CHECK_OPS = new Set<string>([
  String(CMD.BALANCE_CHECK_ERC20).toLowerCase(), // "0e"
  // do NOT include "10" (that's V4_SWAP)
]);

// SAFE shared-blob patcher: adjust ANY (token, owner, min>0) triple
export function patchSharedBlobAdjustTriples(
  blobHex: string,
  t: string,
  ownerCandidatesLower: string[],
  bpsList: number[],
): { patched: string; hits: number } {
  if (!blobHex || typeof blobHex !== 'string' || !blobHex.startsWith('0x')) {
    return { patched: blobHex, hits: 0 };
  }
  const hex = blobHex.slice(2).toLowerCase();
  const WORD = 64;
  if (hex.length < WORD * 3) return { patched: blobHex, hits: 0 };

  const tokenWord = padAddr(t);
  const ownerWords = new Set(ownerCandidatesLower.map(padAddr));

  const totalWords = Math.floor(hex.length / WORD);
  const arr = hex.split('');
  const getWord = (w: number) => hex.slice(w * WORD, (w + 1) * WORD);
  const setWord = (w: number, word: string) => {
    const start = w * WORD;
    for (let i = 0; i < WORD; i++) arr[start + i] = word[i];
  };

  let hits = 0;
  for (let w = 0; w + 2 < totalWords; w++) {
    const w0 = getWord(w); // token
    if (w0 !== tokenWord) continue;
    const w1 = getWord(w + 1); // owner
    if (!ownerWords.has(w1)) continue;
    const w2 = getWord(w + 2); // min
    const minBN = ethers.BigNumber.from('0x' + w2);
    if (minBN.isZero()) continue;

    const newMin = applyBpsSequential(minBN, bpsList);
    if (!newMin.eq(minBN)) {
      setWord(w + 2, to32(newMin));
      hits++;
    }
  }
  return { patched: '0x' + arr.join(''), hits };
}

// Adjust BALANCE_CHECK_* (standalone + blob)
export function adjustBalanceChecksSequential(
  cmdBytes: string[],
  inputs: string[],
  tokenLower: string,
  ownerCandidatesLower: string[],
  bpsList: number[],
  sweepTokenOriginal?: string, // pass typed token address 't'
): number {
  let adjusted = 0;

  for (let i = 0; i < cmdBytes.length; i++) {
    if (!BALANCE_CHECK_OPS.has(cmdBytes[i])) continue;
    const raw = inputs[i];
    if (typeof raw !== 'string') continue;

    // 1) Try simple triple
    let did = false;
    try {
      const [tok, owner, minBal] = ethers.utils.defaultAbiCoder.decode(['address', 'address', 'uint256'], raw);
      const tLower = String(tok).toLowerCase();
      const oLower = String(owner).toLowerCase();
      if (tLower === tokenLower && ownerCandidatesLower.includes(oLower)) {
        const newMin = applyBpsSequential(minBal, bpsList);
        inputs[i] = enc(['address', 'address', 'uint256'], [tok, owner, newMin]);
        adjusted++;
        did = true;
        console.log('🧮 [Fee Collector] Adjusted BALANCE_CHECK (triple)', { i });
      }
    } catch {}

    if (did) continue;

    // 2) Try blob patch (safe)
    if (sweepTokenOriginal) {
      const { patched, hits } = patchSharedBlobAdjustTriples(raw, sweepTokenOriginal, ownerCandidatesLower, bpsList);
      if (hits > 0 && patched !== raw) {
        inputs[i] = patched;
        adjusted += hits;
        console.log('🧮 [Fee Collector] Patched packed BALANCE_CHECK', { i, hits });
      }
    }
  }

  if (adjusted) {
    console.log('🧮 [Fee Collector] Adjusted BALANCE_CHECK (sequential, +blob)', {
      adjusted,
      token: tokenLower,
      owners: ownerCandidatesLower,
      bpsList,
    });
  }
  return adjusted;
}
