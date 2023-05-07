import React from 'react';
import { useAsync } from 'react-async-hook';
import { NftListingItem } from '../../lib/types';
import { getChainProvider } from '../../lib/utils/chains';
import { getNftListingItemTokenData } from '../../lib/utils/tokens';
import { AddressOrDisplay } from '../common/AddressOrDisplay';
import Loadable from '../common/Loadable';

interface Props {
  chainId: number;
  item: NftListingItem;
}

const ListingAsset = ({ item, chainId }: Props) => {
  const provider = getChainProvider(chainId);
  const { result, loading } = useAsync(() => getNftListingItemTokenData(item, provider), []);

  return (
    <Loadable loading={loading}>
      <AddressOrDisplay address={result?.asset} display={result?.display} chainId={chainId} />
    </Loadable>
  );
};

export default ListingAsset;
