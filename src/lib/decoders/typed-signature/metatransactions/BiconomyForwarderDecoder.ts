import { RequestType } from '../../../constants';
import { TransactionMessage, TypedSignatureMessage, WarningData } from '../../../types';
import { AggregateDecoder } from '../../AggregateDecoder';
import { TypedSignatureDecoder } from '../TypedSignatureDecoder';

// https://github.com/bcnmy/mexa/blob/master/contracts/6/forwarder/ERC20Forwarder.sol
export class BiconomyForwarderDecoder implements TypedSignatureDecoder {
  constructor(private transactionDecoder: AggregateDecoder) {}

  decode(message: TypedSignatureMessage): WarningData | undefined {
    const { domain, message: messageData, primaryType } = message?.data?.typedData ?? {};

    if (!domain || !messageData || !primaryType) return undefined;
    if (primaryType !== 'ERC20ForwardRequest') return undefined;

    const { from, to, data } = messageData;
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
