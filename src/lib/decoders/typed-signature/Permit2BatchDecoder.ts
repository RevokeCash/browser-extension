import { WarningType } from '../../constants';
import { AllowanceWarningData, TypedSignatureMessage } from '../../types';
import { TypedSignatureDecoder } from './TypedSignatureDecoder';

export class Permit2BatchDecoder implements TypedSignatureDecoder {
  decode(message: TypedSignatureMessage): AllowanceWarningData | undefined {
    const { domain, message: messageData, primaryType } = message?.data?.typedData ?? {};

    if (!domain || !messageData || !primaryType) return undefined;
    if (primaryType !== 'PermitBatch') return undefined;

    const { details, spender } = messageData;
    const assets = (details ?? [])
      .filter((allowance: any) => allowance.amount !== '0')
      .map((allowance: any) => allowance.token);
    const user = message.data.address;

    if (assets.length === 0) return undefined;

    return {
      type: WarningType.ALLOWANCE,
      requestId: message.requestId,
      bypassed: !!message.data.bypassed,
      hostname: message.data.hostname,
      chainId: message.data.chainId,
      user,
      assets,
      spender,
    };
  }
}
