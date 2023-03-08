import { PlaceHolderItem, WarningType } from '../../../constants';
import { ListingWarningData, TypedSignatureMessage } from '../../../types';
import { getMarketplaceName } from '../../../utils/misc';
import { TypedSignatureDecoder } from '../TypedSignatureDecoder';

export class Seaport1Decoder implements TypedSignatureDecoder {
  decode(message: TypedSignatureMessage): ListingWarningData | undefined {
    const { domain, message: messageData, primaryType } = message?.data?.typedData ?? {};

    if (!domain || !messageData || !primaryType) return undefined;
    if (primaryType !== 'OrderComponents') return undefined;

    const { offer, offerer } = messageData;
    const consideration = (messageData?.consideration ?? []).filter((item: any) => item.recipient === offerer);
    if (consideration.length === 0) {
      consideration.push(PlaceHolderItem.ZERO_ETH);
    }

    if (!offer || !offerer || !consideration) return undefined;

    return {
      type: WarningType.LISTING,
      requestId: message.requestId,
      bypassed: !!message.data.bypassed,
      hostname: message.data.hostname,
      chainId: Number(domain.chainId ?? message.data.chainId),
      platform: getMarketplaceName(domain),
      listing: { offer, consideration },
    };
  }
}
