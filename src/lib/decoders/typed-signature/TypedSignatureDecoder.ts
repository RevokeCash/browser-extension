import { TypedSignatureMessage, WarningData } from '../../types';

export interface TypedSignatureDecoder {
  decode(message: TypedSignatureMessage): WarningData | undefined;
}
