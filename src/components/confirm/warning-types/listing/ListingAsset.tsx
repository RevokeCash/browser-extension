import React from 'react';
import { useAsync } from 'react-async-hook';
import { NftListingItem } from '../../../../lib/types';
import { getNftListingItemTokenData } from '../../../../lib/utils/tokens';
import { AddressOrDisplay } from '../../../common/AddressOrDisplay';
import KeyValue from '../../../common/KeyValue';
import Loadable from '../../../common/Loadable';
import { AssetDisplay } from '../../../common/AssetDisplay';

interface Props {
  chainId: number;
  item: NftListingItem;
}

const ListingAsset = ({ item, chainId }: Props) => {
  const { result, loading, error } = useAsync(() => getNftListingItemTokenData(item, chainId), []);
  const { asset, specification } = result ?? {};

  return (
    <Loadable loading={loading} error={error}>
      <KeyValue>
        <AddressOrDisplay
          address={asset?.address}
          display={<AssetDisplay name={asset?.name} symbol={asset?.symbol} address={asset?.address} />}
        />
        {specification}
      </KeyValue>
    </Loadable>
  );
};

export default ListingAsset;
