import { Address } from 'viem';
import { PlaceHolderItem, WarningType } from '../../../constants';
import { ListingWarningData, NftListing, TypedSignatureMessage } from '../../../types';
import { getMarketplaceName } from '../../../utils/misc';
import { TypedSignatureDecoder } from '../TypedSignatureDecoder';

export class Seaport14Decoder implements TypedSignatureDecoder {
  decode(message: TypedSignatureMessage): ListingWarningData | undefined {
    const { domain, message: messageData, primaryType } = message?.data?.typedData ?? {};
    const { address } = message?.data ?? {};

    if (!domain || !messageData || !primaryType || !address) return undefined;
    if (primaryType !== 'BulkOrder') return undefined;

    const { tree } = messageData;
    if (!tree) return undefined;

    const listing = this.decodeRecursive(tree, address);
    if (listing.offer.length === 0) return undefined;

    return {
      type: WarningType.LISTING,
      requestId: message.requestId,
      bypassed: !!message.data.bypassed,
      hostname: message.data.hostname,
      chainId: Number(domain.chainId ?? message.data.chainId),
      platform: getMarketplaceName(domain),
      listing,
    };
  }

  decodeRecursive(treeNode: any, address: Address): NftListing {
    if (Array.isArray(treeNode)) {
      // Recursively decode all sub-listings
      const listings = treeNode.flatMap((item: any) => this.decodeRecursive(item, address));

      // Merge all sub-listings into a single listing
      return listings.reduce(
        (acc: NftListing, item: NftListing) => ({
          offer: acc.offer.concat(item.offer),
          consideration: acc.consideration.concat(item.consideration),
        }),
        { offer: [], consideration: [] }
      );
    }

    if (treeNode.offerer !== address) return { offer: [], consideration: [] };

    const offer = treeNode.offer;
    const consideration = treeNode.consideration.filter((item: any) => item.recipient === address);

    if (consideration.length === 0) {
      consideration.push(PlaceHolderItem.ZERO_ETH);
    }

    return { offer, consideration };
  }
}
