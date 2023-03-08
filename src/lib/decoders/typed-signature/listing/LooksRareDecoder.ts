import { OpenSeaItemType, WarningType } from '../../../constants';
import { ListingWarningData, TypedSignatureMessage } from '../../../types';
import { getMarketplaceName } from '../../../utils/misc';
import { TypedSignatureDecoder } from '../TypedSignatureDecoder';

export class LooksRareDecoder implements TypedSignatureDecoder {
  decode(message: TypedSignatureMessage): ListingWarningData | undefined {
    const { domain, message: messageData, primaryType } = message?.data?.typedData ?? {};

    if (!domain || !messageData || !primaryType) return undefined;
    if (primaryType !== 'MakerOrder') return undefined;

    const { signer, collection, tokenId, amount, price, currency, minPercentageToAsk } = messageData;
    if (!signer || !collection || !tokenId || !amount || !price || !currency || !minPercentageToAsk) return undefined;

    // Normalise LooksRare listing format to match OpenSea's

    const receiveAmount = ((BigInt(price) * BigInt(minPercentageToAsk)) / BigInt(10_000)).toString();

    const offer = [
      {
        itemType: OpenSeaItemType.ERC1155, // Assume ERC1155 since that also works for ERC721
        token: collection,
        identifierOrCriteria: tokenId,
        startAmount: amount,
        endAmount: amount,
      },
    ];

    const consideration = [
      {
        itemType: OpenSeaItemType.ERC20,
        token: currency,
        identifierOrCriteria: '0',
        startAmount: receiveAmount,
        endAmount: receiveAmount,
        recipient: signer,
      },
    ];

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
