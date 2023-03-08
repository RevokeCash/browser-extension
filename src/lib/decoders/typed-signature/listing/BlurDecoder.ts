import { Address, OpenSeaItemType, WarningType } from '../../../constants';
import { ListingWarningData, TypedSignatureMessage } from '../../../types';
import { getMarketplaceName } from '../../../utils/misc';
import { TypedSignatureDecoder } from '../TypedSignatureDecoder';

export class BlurDecorder implements TypedSignatureDecoder {
  decode(message: TypedSignatureMessage): ListingWarningData | undefined {
    const { domain, message: messageData, primaryType } = message?.data?.typedData ?? {};

    if (!domain || !messageData || !primaryType) return undefined;
    if (primaryType !== 'Order') return undefined;

    const { trader, collection, tokenId, amount, paymentToken, price, fees } = messageData;
    if (!trader || !collection || !tokenId || !amount || !paymentToken || !price || !fees) return undefined;

    // Normalise Blur listing format to match OpenSea's

    const totalFeeRate = fees.reduce((total: bigint, fee: any) => BigInt(fee.rate) + total, BigInt(0));
    const minPercentageToAsk = BigInt(10_000) - totalFeeRate;
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
        itemType: paymentToken === Address.ZERO ? OpenSeaItemType.ETHER : OpenSeaItemType.ERC20,
        token: paymentToken,
        identifierOrCriteria: '0',
        startAmount: receiveAmount,
        endAmount: receiveAmount,
        recipient: trader,
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
