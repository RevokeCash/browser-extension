import { ethers } from 'ethers';
import { decodeExecute, reencodeExecuteFunction } from '../../../shared/abi';
import { bytesList, enc } from '../../../utils/encoding';
import { applyBpsSequential, clampBps } from '../../../utils/math';
import { adjustBalanceChecksSequential } from '../../../handlers/checks';
import { ADDRESS_THIS, CMD, MSG_SENDER } from '../../../../lib/constants';

// Collect all PAY_PORTION bps (same token) BEFORE SWEEP
function collectPriorPayPortions(cmdBytes: string[], inputs: string[], tokenLower: string, sweepIdx: number) {
  const prior: number[] = [];
  let insertIdx = sweepIdx;
  for (let i = 0; i < sweepIdx; i++) {
    if (cmdBytes[i] !== CMD.PAY_PORTION) continue;
    try {
      const [ptoken, , pbps] = ethers.utils.defaultAbiCoder.decode(['address', 'address', 'uint256'], inputs[i]);
      if (String(ptoken).toLowerCase() === tokenLower) {
        const b = Number(ethers.BigNumber.from(pbps).toString());
        if (Number.isFinite(b) && b > 0) {
          prior.push(Math.min(10000, b));
          insertIdx = i + 1; // insert AFTER last existing PP
        }
      }
    } catch {}
  }
  return { prior, insertIdx };
}

// preferred: PAY_PORTION (sequential)
export function injectViaPayPortionSequential(
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

  const sweepIdx = cmdBytes.findIndex((b) => b === CMD.SWEEP);
  if (sweepIdx === -1) return null;

  let tokenLower: string, sweepRecipient: string, minBefore: ethers.BigNumber, typedToken: string;
  try {
    const [tt, r, m] = ethers.utils.defaultAbiCoder.decode(['address', 'address', 'uint256'], inputs[sweepIdx]);
    typedToken = tt;
    tokenLower = String(tt).toLowerCase();
    sweepRecipient = r;
    minBefore = ethers.BigNumber.from(m);
  } catch {
    return null;
  }

  const ourBps = clampBps(ourBpsRaw);
  if (ourBps <= 0) return null;

  // dedupe (token, feeRecipient)
  for (let i = 0; i < cmdBytes.length; i++) {
    if (cmdBytes[i] !== CMD.PAY_PORTION) continue;
    try {
      const [ptoken, precipient] = ethers.utils.defaultAbiCoder.decode(['address', 'address', 'uint256'], inputs[i]);
      if (
        String(ptoken).toLowerCase() === tokenLower &&
        String(precipient).toLowerCase() === String(feeRecipient).toLowerCase()
      ) {
        return null;
      }
    } catch {}
  }

  const { prior, insertIdx } = collectPriorPayPortions(cmdBytes, inputs, tokenLower, sweepIdx);

  const newMin = applyBpsSequential(minBefore, [...prior, ourBps]);
  if (newMin.eq(minBefore)) return null;

  const ourPP = enc(['address', 'address', 'uint256'], [typedToken, feeRecipient, ourBps]);
  const adjustedSweep = enc(['address', 'address', 'uint256'], [typedToken, sweepRecipient, newMin]);

  const ownerCandidates = [
    String(sweepRecipient).toLowerCase(),
    MSG_SENDER.toLowerCase(),
    ADDRESS_THIS.toLowerCase(),
    ...ownerExtrasLower,
  ];

  const adjustedChecks = adjustBalanceChecksSequential(
    cmdBytes,
    inputs,
    tokenLower,
    ownerCandidates,
    [...prior, ourBps],
    typedToken,
  );

  const newCmd = cmdBytes.slice();
  newCmd.splice(insertIdx, 0, CMD.PAY_PORTION);

  const newInputs = inputs.slice();
  newInputs[sweepIdx] = adjustedSweep;
  newInputs.splice(insertIdx, 0, ourPP);

  const newCommandsHex = '0x' + newCmd.join('');
  const newData = reencodeExecuteFunction(newCommandsHex, newInputs, dec.deadline);

  return { data: newData, adjustedChecks };
}
