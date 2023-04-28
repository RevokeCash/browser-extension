import { BigNumber } from 'ethers';
import { WarningType } from '../../constants';
import { AllowanceWarningData, TypedSignatureMessage } from '../../types';
import { TypedSignatureDecoder } from './TypedSignatureDecoder';

export class PermitDecoder implements TypedSignatureDecoder {
  decode(message: TypedSignatureMessage): AllowanceWarningData | undefined {
    const { domain, message: messageData, primaryType } = message?.data?.typedData ?? {};

    if (!domain || !messageData || !primaryType) return undefined;
    if (primaryType !== 'Permit') return undefined;

    const asset = domain.verifyingContract;
    const { spender, value, allowed, holder, owner } = messageData;
    const user = owner ?? holder;

    if (!asset) return undefined;
    try {
      if (value !== undefined && BigNumber.from(value).isZero()) return undefined;
      if (allowed !== undefined && String(allowed) !== 'true') return undefined;
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
