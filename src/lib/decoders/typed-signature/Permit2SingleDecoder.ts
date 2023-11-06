import { WarningType } from '../../constants';
import { AllowanceWarningData, TypedSignatureMessage } from '../../types';
import { TypedSignatureDecoder } from './TypedSignatureDecoder';

export class Permit2SingleDecoder implements TypedSignatureDecoder {
  decode(message: TypedSignatureMessage): AllowanceWarningData | undefined {
    const { domain, message: messageData, primaryType } = message?.data?.typedData ?? {};

    if (!domain || !messageData || !primaryType) return undefined;
    if (primaryType !== 'PermitSingle') return undefined;

    const { details, spender } = messageData;
    const { token: asset, amount } = details ?? {};
    const user = message.data.address;

    try {
      if (!asset || BigInt(amount) === 0n) return undefined;
    } catch {
      return undefined;
    }

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
