import { RequestType } from '../../../constants';
import { TransactionMessage, TypedSignatureMessage, WarningData } from '../../../types';
import { AggregateDecoder } from '../../AggregateDecoder';
import { TypedSignatureDecoder } from '../TypedSignatureDecoder';

// https://ctf-react.opengsn.org/
export class GsnRelayDecoder implements TypedSignatureDecoder {
  constructor(private transactionDecoder: AggregateDecoder) {}

  decode(message: TypedSignatureMessage): WarningData | undefined {
    const { domain, message: messageData, primaryType } = message?.data?.typedData ?? {};

    if (!domain || !messageData || !primaryType) return undefined;
    if (primaryType !== 'RelayRequest') return undefined;

    const { from, to, data } = messageData;
    if (!from || !to || !data) return undefined;
    const transaction = { from, to, data };

    const transactionMessage: TransactionMessage = {
      ...message,
      data: {
        ...message.data,
        type: RequestType.TRANSACTION,
        transaction,
        chainId: Number(domain.chainId) ?? message.data.chainId, // GSN Relay may use chainId in the EIP712 domain
      },
    };

    return this.transactionDecoder.decode(transactionMessage);
  }
}
