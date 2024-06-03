import React from 'react';
import { useTranslations } from '../../i18n';
import { PlaceHolderItem } from '../../lib/constants';
import { ListingWarningData } from '../../lib/types';
import ListingAsset from './ListingAsset';

interface Props {
  data: ListingWarningData;
}

const ListingInfo = ({ data }: Props) => {
  const t = useTranslations();

  const consideration = data.listing.consideration.length > 0 ? data.listing.consideration : [PlaceHolderItem.ZERO_ETH];

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="font-bold text-lg leading-tight">{t('confirm_listing.you_sell')}</div>
        <div className="flex flex-col items-center">
          {data.listing.offer.map((asset, i) => (
            <ListingAsset key={`${JSON.stringify(asset)}-${i}`} item={asset} chainId={data.chainId} />
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="font-bold text-lg leading-tight">{t('confirm_listing.you_receive')}</div>
        <div className="flex flex-col items-center">
          {consideration.map((asset, i) => (
            <ListingAsset key={`${JSON.stringify(asset)}-${i}`} item={asset} chainId={data.chainId} />
          ))}
        </div>
      </div>
    </>
  );
};

export default ListingInfo;
