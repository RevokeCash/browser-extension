import {
  isTransactionMessage,
  isTypedSignatureMessage,
  isUntypedSignatureMessage,
  Message,
  WarningData,
} from '../types';
import { Decoder } from './Decoder';
import { TransactionDecoder } from './transaction/TransactionDecoder';
import { TypedSignatureDecoder } from './typed-signature/TypedSignatureDecoder';
import { UntypedSignatureDecoder } from './untyped-signature/UntypedSignatureDecoder';

export class AggregateDecoder implements Decoder {
  constructor(
    private transactionDecoders: TransactionDecoder[],
    private typedSignatureDecoders: TypedSignatureDecoder[],
    private untypedSignatureDecoders: UntypedSignatureDecoder[]
  ) {}

  decode(message: Message): WarningData | undefined {
    if (isTransactionMessage(message)) {
      return this.aggregateDecode(this.transactionDecoders, message);
    } else if (isTypedSignatureMessage(message)) {
      return this.aggregateDecode(this.typedSignatureDecoders, message);
    } else if (isUntypedSignatureMessage(message)) {
      return this.aggregateDecode(this.untypedSignatureDecoders, message);
    }

    return undefined;
  }

  aggregateDecode(decoders: Decoder[], message: Message) {
    return decoders.reduce<WarningData | undefined>((acc, decoder) => {
      return acc || decoder.decode(message);
    }, undefined);
  }
}
