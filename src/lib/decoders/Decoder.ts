import { Message, WarningData } from '../types';

export interface Decoder {
  decode(message: Message): WarningData | undefined;
}
