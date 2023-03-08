import { PlaceHolderItem, WarningType } from '../../../constants';
import { ListingWarningData, TypedSignatureMessage } from '../../../types';
import { getMarketplaceName } from '../../../utils/misc';
import { TypedSignatureDecoder } from '../TypedSignatureDecoder';

export class BlurBulkDecoder implements TypedSignatureDecoder {
  decode(message: TypedSignatureMessage): ListingWarningData | undefined {
    const { domain, message: messageData, primaryType } = message?.data?.typedData ?? {};

    if (!domain || !messageData || !primaryType) return undefined;
    if (primaryType !== 'Root') return undefined;

    return {
      type: WarningType.LISTING,
      requestId: message.requestId,
      bypassed: !!message.data.bypassed,
      hostname: message.data.hostname,
      chainId: Number(domain.chainId ?? message.data.chainId),
      platform: getMarketplaceName(domain),
      listing: { offer: [PlaceHolderItem.UNKNOWN], consideration: [PlaceHolderItem.UNKNOWN] },
    };
  }
}
