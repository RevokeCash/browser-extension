import { decodeFunctionData, parseAbi } from 'viem';
import { Signature, SignatureIdentifier, WarningType } from '../../constants';
import { AllowanceWarningData, TransactionMessage } from '../../types';
import { TransactionDecoder } from './TransactionDecoder';

export class SetApprovalForAllDecoder implements TransactionDecoder {
  decode(message: TransactionMessage): AllowanceWarningData | undefined {
    const { data, from: user, to: asset } = message?.data?.transaction ?? {};

    if (!data || !user || !asset) return undefined;
    if (!data.startsWith(SignatureIdentifier.setApprovalForAll)) return undefined;

    const decoded = decodeFunctionData({
      abi: parseAbi([`function ${Signature.setApprovalForAll}`]),
      data,
    });

    const [spender, approved] = decoded.args;

    if (!approved) return undefined;

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
