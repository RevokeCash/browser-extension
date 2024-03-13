import { decodeFunctionData, parseAbi } from 'viem';
import { Address, Signature, SignatureIdentifier, WarningType } from '../../constants';
import { AllowanceWarningData, TransactionMessage } from '../../types';
import { TransactionDecoder } from './TransactionDecoder';

export class Permit2ApproveDecoder implements TransactionDecoder {
  decode(message: TransactionMessage): AllowanceWarningData | undefined {
    const { data, from: user } = message?.data?.transaction ?? {};

    if (!data || !user) return undefined;
    if (!data.startsWith(SignatureIdentifier.permit2Approve)) return undefined;

    const decoded = decodeFunctionData({
      abi: parseAbi([`function ${Signature.permit2Approve}`]),
      data,
    });

    const [asset, spender, approval] = decoded.args;

    if (!asset || asset === Address.ZERO) return undefined;

    try {
      if (approval === 0n || spender === Address.ZERO) return undefined;
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
