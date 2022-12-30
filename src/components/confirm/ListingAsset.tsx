import React from 'react';
import { useAsync } from 'react-async-hook';
import { INFURA_API_KEY } from '../../lib/constants';
import { NftListingItem } from '../../lib/types';
import { getChainExplorerUrl, getChainProvider } from '../../lib/utils/chains';
import { getNftListingItemTokenData } from '../../lib/utils/tokens';
import Href from '../common/Href';
import Loadable from '../common/Loadable';

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
          <Href underline="always" href={`${explorerUrl}/address/${result?.asset}`}>
            {result?.display}
          </Href>
        ) : (
          result?.display
        )}
      </div>
    </Loadable>
  );
};

export default ListingAsset;
