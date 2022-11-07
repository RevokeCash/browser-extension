import React from 'react';
import { useAsync } from 'react-async-hook';
import { INFURA_API_KEY } from '../lib/constants';
import { NftListingItem } from '../lib/types';
import { getChainExplorerUrl, getChainProvider } from '../lib/utils/chains';
import { getNftListingItemTokenData } from '../lib/utils/tokens';
import Link from './Link';
import Loadable from './Loadable';

interface Props {
  chainId: number;
  item: NftListingItem;
}

const ListingAsset = ({ item, chainId }: Props) => {
  const provider = getChainProvider(chainId, INFURA_API_KEY);
  const explorerUrl = getChainExplorerUrl(chainId);

  const { result, loading } = useAsync(() => getNftListingItemTokenData(item, provider), []);

  return (
    <Loadable loading={loading}>
      <div>
        {result?.asset ? (
          <Link href={`${explorerUrl}/address/${result?.asset}`}>{result?.display}</Link>
        ) : (
          result?.display
        )}
      </div>
    </Loadable>
  );
};

export default ListingAsset;
