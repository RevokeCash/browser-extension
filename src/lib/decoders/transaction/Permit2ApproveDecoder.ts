import { BigNumber } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import { Address, Signature, SignatureIdentifier, WarningType } from '../../constants';
import { AllowanceWarningData, TransactionMessage } from '../../types';
import { TransactionDecoder } from './TransactionDecoder';

export class Permit2ApproveDecoder implements TransactionDecoder {
  decode(message: TransactionMessage): AllowanceWarningData | undefined {
    const { data, from: user } = message?.data?.transaction ?? {};

    if (!data || !user) return undefined;
    if (!data.startsWith(SignatureIdentifier.permit2Approve)) return undefined;

    const iface = new Interface([`function ${Signature.permit2Approve}`]);
    const decoded = iface.decodeFunctionData(Signature.permit2Approve, data);
    const [asset, spender, approval] = Array.from(decoded);

    if (!asset || asset === Address.ZERO) return undefined;

    try {
      if (BigNumber.from(approval).isZero() || spender === Address.ZERO) return undefined;
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
