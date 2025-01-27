import { potentialScamSignatures, WarningType } from '../../constants';
import { SuspectedScamWarningData, TransactionMessage } from '../../types';
import { TransactionDecoder } from './TransactionDecoder';

export class SuspectedScamDecoder implements TransactionDecoder {
  decode(message: TransactionMessage): SuspectedScamWarningData | undefined {
    const { data, to, value } = message?.data?.transaction ?? {};

    if (!data || !to || !value) return undefined;

    const valueAsNumber = Number(value) || Number(`0x${value}`);

    // If the transaction does not include a value, it is most likely not a "suspected scam"
    if (Number.isNaN(valueAsNumber) || valueAsNumber === 0) return undefined;

    // Some legitimate transactions include small "claim" fees (e.g. unvest), so we ignore them
    if (valueAsNumber < 0.002) return undefined;

    // Check if the function call is one of the common scam functions
    if (!potentialScamSignatures.includes(data.slice(0, 10))) return undefined;

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
