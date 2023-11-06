import React from 'react';
import { useAsync } from 'react-async-hook';
import { NftListingItem } from '../../lib/types';
import { createViemPublicClientForChain } from '../../lib/utils/chains';
import { getNftListingItemTokenData } from '../../lib/utils/tokens';
import { AddressOrDisplay } from '../common/AddressOrDisplay';
import Loadable from '../common/Loadable';

interface Props {
  chainId: number;
  item: NftListingItem;
}

const ListingAsset = ({ item, chainId }: Props) => {
  const client = createViemPublicClientForChain(chainId);
  const { result, loading } = useAsync(() => getNftListingItemTokenData(item, client), []);

  return (
    <Loadable loading={loading}>
      <AddressOrDisplay address={result?.asset} display={result?.display} chainId={chainId} />
    </Loadable>
  );
};

export default ListingAsset;
