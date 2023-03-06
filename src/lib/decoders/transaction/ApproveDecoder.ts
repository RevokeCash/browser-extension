import { BigNumber } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import { Address, Signature, SignatureIdentifier, WarningType } from '../../constants';
import { AllowanceWarningData, TransactionMessage } from '../../types';
import { TransactionDecoder } from './TransactionDecoder';

export class ApproveDecoder implements TransactionDecoder {
  decode(message: TransactionMessage): AllowanceWarningData | undefined {
    const { data, from: user, to: asset } = message?.data?.transaction ?? {};

    if (!data || !user || !asset) return undefined;
    if (!data.startsWith(SignatureIdentifier.approve)) return undefined;

    const iface = new Interface([`function ${Signature.approve}`]);
    const decoded = iface.decodeFunctionData(Signature.approve, data);
    const [spender, approval] = Array.from(decoded);

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
      asset,
      spender,
    };
  }
}
