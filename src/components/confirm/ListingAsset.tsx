import React from 'react';
import { useAsync } from 'react-async-hook';
import { NftListingItem } from '../../lib/types';
import { getNftListingItemTokenData } from '../../lib/utils/tokens';
import { AddressOrDisplay } from '../common/AddressOrDisplay';
import Loadable from '../common/Loadable';

interface Props {
  chainId: number;
  item: NftListingItem;
}

const ListingAsset = ({ item, chainId }: Props) => {
  const { result, loading, error } = useAsync(() => getNftListingItemTokenData(item, chainId), []);

  return (
    <Loadable loading={loading} error={error}>
      <AddressOrDisplay address={result?.asset} display={result?.display} chainId={chainId} />
    </Loadable>
  );
};

export default ListingAsset;
