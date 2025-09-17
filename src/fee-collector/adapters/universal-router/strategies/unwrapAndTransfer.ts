import { ethers } from 'ethers';
import { decodeExecute, reencodeExecuteFunction } from '../../../shared/abi';
import { bytesList, enc } from '../../../utils/encoding';
import { applyBpsSequential, clampBps, seqDelta } from '../../../utils/math';
import { adjustBalanceChecksSequential } from '../../../handlers/checks';
import { ADDRESS_THIS, CMD, MSG_SENDER, WRAPPED_NATIVE } from '../../../../lib/constants';

export function injectViaReplaceEthSweepWithUnwrapAndTransfer(
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

  // last SWEEP
  const sweepRev = [...cmdBytes].reverse().findIndex((b) => b === CMD.SWEEP);
  if (sweepRev === -1) return null;
  const sweepIdx = cmdBytes.length - 1 - sweepRev;

  // SWEEP(token, recipient, minAmount)
  let tokenLower: string, userRecipient: string, minBefore: ethers.BigNumber, typedToken: string;
  try {
    const [tt, r, m] = ethers.utils.defaultAbiCoder.decode(['address', 'address', 'uint256'], inputs[sweepIdx]);
    typedToken = tt;
    tokenLower = String(tt).toLowerCase();
    userRecipient = r;
    minBefore = ethers.BigNumber.from(m);
  } catch {
    return null;
  }

  // Only ETH (address(0))
  if (tokenLower !== '0x0000000000000000000000000000000000000000') return null;

  const ourBps = clampBps(ourBpsRaw);
  if (ourBps <= 0) return null;

  const priorBps: number[] = [];
  for (let i = 0; i < sweepIdx; i++) {
    if (cmdBytes[i] !== CMD.PAY_PORTION) continue;
    try {
      const [ptoken, , pbps] = ethers.utils.defaultAbiCoder.decode(['address', 'address', 'uint256'], inputs[i]);
      if (String(ptoken).toLowerCase() === tokenLower) {
        const b = Number(ethers.BigNumber.from(pbps).toString());
        if (Number.isFinite(b) && b > 0) priorBps.push(Math.min(10000, b));
      }
    } catch {}
  }

  const newMin = applyBpsSequential(minBefore, [...priorBps, ourBps]);
  const ourFee = seqDelta(minBefore, priorBps, ourBps);
  if (newMin.eq(minBefore)) return null;

  const WRAP = WRAPPED_NATIVE[chainId ?? 1] ?? WRAPPED_NATIVE[1];

  // TRANSFER(WRAP -> feeRecipient, ourFee) + UNWRAP_WETH(userRecipient, newMin)
  const feeTransfer = enc(['address', 'address', 'uint256'], [WRAP, feeRecipient, ourFee]);
  const unwrapToUser = enc(['address', 'uint256'], [userRecipient, newMin]);

  const ownerCandidates = [
    String(userRecipient).toLowerCase(),
    MSG_SENDER.toLowerCase(),
    ADDRESS_THIS.toLowerCase(),
    ...ownerExtrasLower,
  ];

  const adjustedChecks = adjustBalanceChecksSequential(
    cmdBytes,
    inputs,
    tokenLower,
    ownerCandidates,
    [...priorBps, ourBps],
    typedToken,
  );

  const newCmd = cmdBytes.slice();
  newCmd.splice(sweepIdx, 1, CMD.TRANSFER, CMD.UNWRAP_WETH);

  const newInputs = inputs.slice();
  newInputs.splice(sweepIdx, 1, feeTransfer, unwrapToUser);

  const commandsHex = '0x' + newCmd.join('');
  const newData = reencodeExecuteFunction(commandsHex, newInputs, dec.deadline);
  return { data: newData, adjustedChecks };
}
