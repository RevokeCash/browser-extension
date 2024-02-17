import { decodeFunctionData, parseAbi } from 'viem';
import { Signature, SignatureIdentifier, WarningType } from '../../constants';
import { AllowanceWarningData, TransactionMessage } from '../../types';
import { TransactionDecoder } from './TransactionDecoder';

// Note: increaseApproval() is an alternative to increaseAllowance with the same semantics, but much less common
export class IncreaseApprovalDecoder implements TransactionDecoder {
  decode(message: TransactionMessage): AllowanceWarningData | undefined {
    const { data, from: user, to: asset } = message?.data?.transaction ?? {};

    if (!data || !user || !asset) return undefined;
    if (!data.startsWith(SignatureIdentifier.increaseAllowance)) return undefined;

    const decoded = decodeFunctionData({
      abi: parseAbi([`function ${Signature.increaseAllowance}`]),
      data,
    });

    const [spender, approval] = decoded.args;

    try {
      if (approval === 0n) return undefined;
    } catch {
      return undefined;
    }

    return {
      type: WarningType.ALLOWANCE,
      requestId: message.requestId,
      bypassed: !!message.data.bypassed,
      hostname: message.data.hostname,
      chainId: message.data.chainId,
      user,
      assets: [asset],
      spender,
    };
  }
}
