import { ethers } from 'ethers';
import { decodeExecute, reencodeExecuteFunction } from '../../../shared/abi';
import { bytesList, enc } from '../../../utils/encoding';
import { applyBpsSequential, clampBps } from '../../../utils/math';
import { adjustBalanceChecksSequential } from '../../../handlers/checks';
import { ADDRESS_THIS, CMD, MSG_SENDER, WRAPPED_NATIVE } from '../../../../lib/constants';

const dc = ethers.utils.defaultAbiCoder;
// Coerce ethers.Result (array-like) → real array
const asArr = (r: any): any[] => (Array.isArray(r) ? r : Array.from(r));

export function injectViaRewriteSwapBeforeUnwrapAndAppendFee(
  originalData: string,
  feeRecipient: string,
  ourBpsRaw: number,
  ownerExtrasLower: string[] = [],
  chainId?: number,
): { data: string; adjustedChecks: number } | null {
  const dec = decodeExecute(originalData);
  if (!dec) return null;

  const cmdBytes = bytesList(dec.commands);
  const inputs = dec.inputs.slice();
  if (cmdBytes.length !== inputs.length) return null;

  // last UNWRAP_WETH
  const unwrapRev = [...cmdBytes].reverse().findIndex((b) => b === CMD.UNWRAP_WETH);
  if (unwrapRev === -1) return null;
  const unwrapIdx = cmdBytes.length - 1 - unwrapRev;

  // UNWRAP_WETH(to, min)
  let userRecipient: string, minBefore: ethers.BigNumber;
  try {
    const tup = asArr(dc.decode(['address', 'uint256'], inputs[unwrapIdx]));
    const to = tup[0] as string;
    const min = tup[1];
    userRecipient = to;
    minBefore = ethers.BigNumber.from(min);
  } catch {
    return null;
  }

  const ourBps = clampBps(ourBpsRaw);
  if (ourBps <= 0) return null;

  // find swap right before unwrap
  let swapIdx = -1;
  for (let i = unwrapIdx - 1; i >= 0; i--) {
    const c = cmdBytes[i];
    if (
      c === CMD.V3_SWAP_EXACT_IN ||
      c === CMD.V3_SWAP_EXACT_OUT ||
      c === CMD.V2_SWAP_EXACT_IN ||
      c === CMD.V2_SWAP_EXACT_OUT
    ) {
      swapIdx = i;
      break;
    }
    if (c === CMD.SWEEP || c === CMD.UNWRAP_WETH) break;
  }
  if (swapIdx === -1) return null;

  const raw = inputs[swapIdx];
  const WRAP = (WRAPPED_NATIVE[chainId ?? 1] ?? WRAPPED_NATIVE[1]).toLowerCase();

  // decoders
  const tryDecodeV3 = (raw0: string) => {
    const layouts: any[] = [
      ['address', 'uint256', 'uint256', 'bytes', 'bool'],
      ['bytes', 'address', 'uint256', 'uint256', 'bool'],
    ];
    for (const L of layouts) {
      try {
        const t = asArr(dc.decode(L, raw0));
        let recipient: string, amountA: any, amountB: any, path: string;
        if (L[0] === 'address') {
          recipient = t[0];
          amountA = t[1];
          amountB = t[2];
          path = t[3];
        } else {
          path = t[0];
          recipient = t[1];
          amountA = t[2];
          amountB = t[3];
        }
        const hex = String(path).slice(2);
        if (!hex || hex.length < 40) continue;
        const tokenOut = ('0x' + hex.slice(-40)).toLowerCase();
        return { recipient, amountA, amountB, path, layout: L, tokenOut };
      } catch {}
    }
    return null;
  };

  const tryDecodeV2 = (raw0: string) => {
    try {
      const t = asArr(dc.decode(['address', 'uint256', 'uint256', 'address[]', 'bool'], raw0));
      const recipient = t[0] as string;
      const amountA = t[1];
      const amountB = t[2];
      const pathArr = t[3] as string[];
      if (!pathArr?.length) return null;
      const tokenOut = String(pathArr[pathArr.length - 1]).toLowerCase();
      return { recipient, amountA, amountB, pathArr, tokenOut };
    } catch {
      return null;
    }
  };

  const cmd = cmdBytes[swapIdx];
  const isV3 = cmd === CMD.V3_SWAP_EXACT_IN || cmd === CMD.V3_SWAP_EXACT_OUT;
  const v3 = isV3 ? tryDecodeV3(raw) : null;
  const v2 = !isV3 ? tryDecodeV2(raw) : null;
  if (!v3 && !v2) return null;

  const outToken = (v3?.tokenOut ?? v2!.tokenOut).toLowerCase();
  if (outToken !== WRAP) return null;

  const newMin = applyBpsSequential(minBefore, [ourBps]);
  if (newMin.eq(minBefore)) return null;

  const ownerCandidates = [
    String(userRecipient).toLowerCase(),
    MSG_SENDER.toLowerCase(),
    ADDRESS_THIS.toLowerCase(),
    ...ownerExtrasLower,
  ];

  // rewrite swap: set recipient=ADDRESS_THIS and lower min/target
  let newSwapInputs: string;
  try {
    if (v3) {
      const L = v3.layout;
      const t = asArr(dc.decode(L, raw));
      if (cmd === CMD.V3_SWAP_EXACT_IN) {
        if (L[0] === 'address') {
          newSwapInputs = dc.encode(L, [ADDRESS_THIS, t[1], newMin, t[3], t[4]]);
        } else {
          newSwapInputs = dc.encode(L, [t[0], ADDRESS_THIS, t[2], newMin, t[4]]);
        }
      } else {
        if (L[0] === 'address') {
          newSwapInputs = dc.encode(L, [ADDRESS_THIS, newMin, t[2], t[3], t[4]]);
        } else {
          newSwapInputs = dc.encode(L, [t[0], ADDRESS_THIS, newMin, t[3], t[4]]);
        }
      }
    } else {
      const t = asArr(dc.decode(['address', 'uint256', 'uint256', 'address[]', 'bool'], raw));
      if (cmd === CMD.V2_SWAP_EXACT_IN) {
        newSwapInputs = dc.encode(
          ['address', 'uint256', 'uint256', 'address[]', 'bool'],
          [ADDRESS_THIS, t[1], newMin, t[3], t[4]],
        );
      } else {
        newSwapInputs = dc.encode(
          ['address', 'uint256', 'uint256', 'address[]', 'bool'],
          [ADDRESS_THIS, newMin, t[2], t[3], t[4]],
        );
      }
    }
  } catch {
    return null;
  }

  const feePP = enc(['address', 'address', 'uint256'], [outToken, feeRecipient, ourBps]);
  const newUnwrap = enc(['address', 'uint256'], [userRecipient, newMin]);

  const adjustedChecks = adjustBalanceChecksSequential(cmdBytes, inputs, outToken, ownerCandidates, [ourBps], outToken);

  const newCmd = cmdBytes.slice();
  const newInputs = inputs.slice();

  newInputs[swapIdx] = newSwapInputs;
  newCmd.splice(unwrapIdx, 0, CMD.PAY_PORTION);
  newInputs.splice(unwrapIdx, 0, feePP);
  newInputs[unwrapIdx + 1] = newUnwrap;

  const newCommandsHex = '0x' + newCmd.join('');
  const newData = reencodeExecuteFunction(newCommandsHex, newInputs, dec.deadline);
  return { data: newData, adjustedChecks };
}
