import { ethers } from 'ethers';
import { decodeExecute, reencodeExecuteFunction } from '../../../shared/abi';
import { bytesList, enc } from '../../../utils/encoding';
import { applyBpsSequential, clampBps } from '../../../utils/math';
import { adjustBalanceChecksSequential } from '../../../handlers/checks';
import { ADDRESS_THIS, CMD, MSG_SENDER } from '../../../../lib/constants';

const dc = ethers.utils.defaultAbiCoder;
// Coerce ethers.Result (array-like) → real array
const asArr = (r: any): any[] => (Array.isArray(r) ? r : Array.from(r));

export function injectViaRewriteSwapAndAppendFee(
  originalData: string,
  feeRecipient: string,
  ourBpsRaw: number,
  ownerExtrasLower: string[] = [],
): { data: string; adjustedChecks: number } | null {
  const dec = decodeExecute(originalData);
  if (!dec) return null;

  const cmdBytes = bytesList(dec.commands);
  const inputs = dec.inputs.slice();
  if (cmdBytes.length !== inputs.length) return null;

  // If there is already a SWEEP, let other strategies handle it
  const hasSweep = cmdBytes.some((b) => b === CMD.SWEEP);
  if (hasSweep) return null;

  const lastIdx = cmdBytes.length - 1;
  const lastCmd = cmdBytes[lastIdx];
  const isV3 = lastCmd === CMD.V3_SWAP_EXACT_IN || lastCmd === CMD.V3_SWAP_EXACT_OUT;
  const isV2 = lastCmd === CMD.V2_SWAP_EXACT_IN || lastCmd === CMD.V2_SWAP_EXACT_OUT;
  if (!isV3 && !isV2) return null;

  const ourBps = clampBps(ourBpsRaw);
  if (ourBps <= 0) return null;

  const tryDecodeV3 = (raw: string) => {
    const layouts: any[] = [
      ['address', 'uint256', 'uint256', 'bytes', 'bool'],
      ['bytes', 'address', 'uint256', 'uint256', 'bool'],
    ];
    for (const L of layouts) {
      try {
        const tup = asArr(dc.decode(L, raw));
        let recipient: string, minBN: any, path: string;
        if (L[0] === 'address') {
          recipient = tup[0];
          minBN = tup[2];
          path = tup[3];
        } else {
          path = tup[0];
          recipient = tup[1];
          minBN = tup[3];
        }
        const hex = String(path).slice(2);
        if (hex.length < 40) continue;
        const tokenOut = '0x' + hex.slice(-40);
        return { recipient, minBN: ethers.BigNumber.from(minBN), tokenOut, layout: L };
      } catch {}
    }
    return null;
  };

  const tryDecodeV2 = (raw: string) => {
    try {
      const tup = asArr(dc.decode(['address', 'uint256', 'uint256', 'address[]', 'bool'], raw));
      const recipient = tup[0] as string;
      const minBN = ethers.BigNumber.from(tup[2]);
      const pathArr = tup[3] as string[];
      if (!Array.isArray(pathArr) || pathArr.length < 2) return null;
      const tokenOut = String(pathArr[pathArr.length - 1]);
      return { recipient, minBN, tokenOut };
    } catch {
      return null;
    }
  };

  const raw = inputs[lastIdx];
  const v3 = isV3 ? tryDecodeV3(raw) : null;
  const v2 = !v3 && isV2 ? tryDecodeV2(raw) : null;
  if (!v3 && !v2) return null;

  const recipientOrig = v3?.recipient ?? v2!.recipient;
  const minBefore: ethers.BigNumber = v3?.minBN ?? v2!.minBN;
  const outToken = (v3?.tokenOut ?? v2!.tokenOut).toLowerCase();

  const newMin = applyBpsSequential(minBefore, [ourBps]);
  if (newMin.eq(minBefore)) return null;

  const ownerCandidates = [
    String(recipientOrig).toLowerCase(),
    MSG_SENDER.toLowerCase(),
    ADDRESS_THIS.toLowerCase(),
    ...ownerExtrasLower,
  ];

  // rewrite the swap recipient to ADDRESS_THIS and lower min
  let newSwapInputs: string;
  try {
    if (v3) {
      const L = v3.layout;
      const tup = asArr(dc.decode(L, raw));
      if (L[0] === 'address') {
        newSwapInputs = dc.encode(L, [ADDRESS_THIS, tup[1], newMin, tup[3], tup[4]]);
      } else {
        newSwapInputs = dc.encode(L, [tup[0], ADDRESS_THIS, tup[2], newMin, tup[4]]);
      }
    } else {
      const tup = asArr(dc.decode(['address', 'uint256', 'uint256', 'address[]', 'bool'], raw));
      newSwapInputs = dc.encode(
        ['address', 'uint256', 'uint256', 'address[]', 'bool'],
        [ADDRESS_THIS, tup[1], newMin, tup[3], tup[4]],
      );
    }
  } catch {
    return null;
  }

  const ourPP = enc(['address', 'address', 'uint256'], [outToken, feeRecipient, ourBps]);
  const adjustedSweep = enc(['address', 'address', 'uint256'], [outToken, recipientOrig, newMin]);

  const adjustedChecks = adjustBalanceChecksSequential(cmdBytes, inputs, outToken, ownerCandidates, [ourBps], outToken);

  const newCmd = cmdBytes.slice();
  const newInputs = inputs.slice();

  newInputs[lastIdx] = newSwapInputs;
  newCmd.splice(lastIdx + 1, 0, CMD.PAY_PORTION, CMD.SWEEP);
  newInputs.splice(lastIdx + 1, 0, ourPP, adjustedSweep);

  const newCommandsHex = '0x' + newCmd.join('');
  const newData = reencodeExecuteFunction(newCommandsHex, newInputs, dec.deadline);
  return { data: newData, adjustedChecks };
}
