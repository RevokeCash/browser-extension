import { ethers } from 'ethers';
import { decodeExecute, reencodeExecuteFunction } from '../../../shared/abi';
import { bytesList, enc } from '../../../utils/encoding';
import { applyBpsSequential, clampBps, seqDelta } from '../../../utils/math';
import { adjustBalanceChecksSequential } from '../../../handlers/checks';
import { ADDRESS_THIS, CMD, MSG_SENDER } from '../../../../lib/constants';

export function injectViaTransferFallback(
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

  let tokenLower: string, recipient: string, minBefore: ethers.BigNumber, typedToken: string;
  try {
    const [tt, r, m] = ethers.utils.defaultAbiCoder.decode(['address', 'address', 'uint256'], inputs[sweepIdx]);
    typedToken = tt;
    tokenLower = String(tt).toLowerCase();
    recipient = r;
    minBefore = ethers.BigNumber.from(m);
  } catch {
    return null;
  }

  const ourBps = clampBps(ourBpsRaw);
  if (ourBps <= 0) return null;

  // prior PPs for same token
  const prior: number[] = [];
  for (let i = 0; i < sweepIdx; i++) {
    if (cmdBytes[i] !== CMD.PAY_PORTION) continue;
    try {
      const [ptoken, , pbps] = ethers.utils.defaultAbiCoder.decode(['address', 'address', 'uint256'], inputs[i]);
      if (String(ptoken).toLowerCase() === tokenLower) {
        const b = Number(ethers.BigNumber.from(pbps).toString());
        if (Number.isFinite(b) && b > 0) prior.push(Math.min(10000, b));
      }
    } catch {}
  }

  const newMin = applyBpsSequential(minBefore, [...prior, ourBps]);
  const ourFee = seqDelta(minBefore, prior, ourBps);
  if (newMin.eq(minBefore)) return null;

  const adjustedSweep = enc(['address', 'address', 'uint256'], [typedToken, recipient, newMin]);
  const feeInput = enc(['address', 'address', 'uint256'], [typedToken, feeRecipient, ourFee]);

  const ownerCandidates = [
    String(recipient).toLowerCase(),
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
  newCmd.splice(sweepIdx, 0, CMD.TRANSFER);

  const newInputs = inputs.slice();
  newInputs[sweepIdx] = adjustedSweep;
  newInputs.splice(sweepIdx, 0, feeInput);

  const newCommandsHex = '0x' + newCmd.join('');
  const newData = reencodeExecuteFunction(newCommandsHex, newInputs, dec.deadline);

  return { data: newData, adjustedChecks };
}
