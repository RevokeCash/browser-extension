import { ScamSignatureIdentifier, WarningType } from '../../constants';
import { SuspectedScamWarningData, TransactionMessage } from '../../types';
import { TransactionDecoder } from './TransactionDecoder';

export class SuspectedScamDecoder implements TransactionDecoder {
  decode(message: TransactionMessage): SuspectedScamWarningData | undefined {
    const { data, to } = message?.data?.transaction ?? {};

    if (!data || !to) return undefined;
    if (!data.startsWith(ScamSignatureIdentifier.SecurityUpdate)) return undefined;

    return {
      type: WarningType.SUSPECTED_SCAM,
      requestId: message.requestId,
      bypassed: !!message.data.bypassed,
      hostname: message.data.hostname,
      chainId: message.data.chainId,
      address: to,
    };
  }
}
