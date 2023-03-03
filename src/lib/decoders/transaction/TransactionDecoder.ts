import { TransactionMessage, WarningData } from '../../types';

export interface TransactionDecoder {
  decode(message: TransactionMessage): WarningData | undefined;
}
