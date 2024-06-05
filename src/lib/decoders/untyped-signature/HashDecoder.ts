import { WarningType } from '../../constants';
import { HashSignatureWarningData, UntypedSignatureMessage } from '../../types';
import { UntypedSignatureDecoder } from './UntypedSignatureDecoder';

export class HashDecoder implements UntypedSignatureDecoder {
  decode(message: UntypedSignatureMessage): HashSignatureWarningData | undefined {
    if (!message.data?.message) return undefined;

    // Check if message is a 32 byte hash
    if (message.data.message.replace(/0x/, '').length !== 64) return undefined;

    return {
      type: WarningType.HASH,
      requestId: message.requestId,
      bypassed: !!message.data.bypassed,
      hostname: message.data.hostname,
      hash: message.data.message,
    };
  }
}
