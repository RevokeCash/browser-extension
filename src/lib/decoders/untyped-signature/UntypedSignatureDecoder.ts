import { UntypedSignatureMessage, WarningData } from '../../types';

export interface UntypedSignatureDecoder {
  decode(message: UntypedSignatureMessage): WarningData | undefined;
}
