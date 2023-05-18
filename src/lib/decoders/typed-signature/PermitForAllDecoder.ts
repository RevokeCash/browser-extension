import { WarningType } from '../../constants';
import { AllowanceWarningData, TypedSignatureMessage } from '../../types';
import { TypedSignatureDecoder } from './TypedSignatureDecoder';

export class PermitForAllDecoder implements TypedSignatureDecoder {
  decode(message: TypedSignatureMessage): AllowanceWarningData | undefined {
    const { domain, message: messageData, primaryType } = message?.data?.typedData ?? {};

    if (!domain || !messageData || !primaryType) return undefined;
    if (primaryType !== 'PermitForAll') return undefined;

    const asset = domain.verifyingContract;
    const { operator: spender, approved, owner: user } = messageData;

    if (!asset || String(approved) !== 'true') return undefined;

    return {
      type: WarningType.ALLOWANCE,
      requestId: message.requestId,
      bypassed: !!message.data.bypassed,
      hostname: message.data.hostname,
      chainId: Number(domain.chainId ?? message.data.chainId),
      user,
      assets: [asset],
      spender,
    };
  }
}
