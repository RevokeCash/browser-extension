import React from 'react';
import { useTranslations } from '../../../../i18n';
import { Address, OpenSeaItemType, PlaceHolderItem } from '../../../../lib/constants';
import { ListingWarningData, NftListingItem } from '../../../../lib/types';
import { getChainExplorerUrl } from '../../../../lib/utils/chains';
import DivideContainer from '../../../common/DivideContainer';
import MenuItemOrLink from '../../../common/MenuItemOrLink';
import DataSeparator from '../../common/DataSeparator';
import ListingAsset from './ListingAsset';

interface Props {
  data: ListingWarningData;
}

const MarketplaceListingData = ({ data }: Props) => {
  const t = useTranslations();

  const consideration = data.listing.consideration.length > 0 ? data.listing.consideration : [PlaceHolderItem.ZERO_ETH];

  const explorerUrl = getChainExplorerUrl(data.chainId);

  const shouldShowLink = (item: NftListingItem) => {
    if (!explorerUrl) return false;
    if (item.itemType === OpenSeaItemType.ETHER) return false;
    if (!item.token) return false;
    if (item.token === Address.ZERO) return false;
    return true;
  };

  return (
    <>
      <DivideContainer>
        {data.listing.offer.map((asset, i) => (
          <MenuItemOrLink
            size="small"
            href={shouldShowLink(asset) ? `${explorerUrl}/address/${asset.token}` : undefined}
            key={`${JSON.stringify(asset)}-${i}`}
          >
            <ListingAsset item={asset} chainId={data.chainId} />
          </MenuItemOrLink>
        ))}
      </DivideContainer>
      <DataSeparator />
      <DivideContainer>
        {consideration.map((asset, i) => (
          <MenuItemOrLink
            size="small"
            href={shouldShowLink(asset) ? `${explorerUrl}/address/${asset.token}` : undefined}
            key={`${JSON.stringify(asset)}-${i}`}
          >
            <ListingAsset item={asset} chainId={data.chainId} />
          </MenuItemOrLink>
        ))}
      </DivideContainer>
    </>
  );
};

export default MarketplaceListingData;
