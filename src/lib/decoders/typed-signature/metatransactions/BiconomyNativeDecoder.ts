import { RequestType } from '../../../constants';
import { TransactionMessage, TypedSignatureMessage, WarningData } from '../../../types';
import { AggregateDecoder } from '../../AggregateDecoder';
import { TypedSignatureDecoder } from '../TypedSignatureDecoder';

// https://docs.biconomy.io/products/enable-gasless-transactions/choose-an-approach-to-enable-gasless/network-agnostic-transactions/custom-approach
export class BiconomyNativeDecoder implements TypedSignatureDecoder {
  constructor(private transactionDecoder: AggregateDecoder) {}

  decode(message: TypedSignatureMessage): WarningData | undefined {
    const { domain, message: messageData, primaryType } = message?.data?.typedData ?? {};

    if (!domain || !messageData || !primaryType) return undefined;
    if (primaryType !== 'MetaTransaction') return undefined;

    const to = domain.verifyingContract;
    const { from, functionSignature: data } = messageData;
    if (!from || !to || !data) return undefined;
    const transaction = { from, to, data };

    const transactionMessage: TransactionMessage = {
      ...message,
      data: {
        ...message.data,
        type: RequestType.TRANSACTION,
        transaction,
        chainId: Number(domain.salt) ?? message.data.chainId, // Biconomy uses salt as chainId
      },
    };

    return this.transactionDecoder.decode(transactionMessage);
  }
}
