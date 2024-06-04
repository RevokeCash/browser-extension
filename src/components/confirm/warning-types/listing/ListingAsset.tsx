import React from 'react';
import { useAsync } from 'react-async-hook';
import { NftListingItem } from '../../../../lib/types';
import { getNftListingItemTokenData } from '../../../../lib/utils/tokens';
import { AddressOrDisplay } from '../../../common/AddressOrDisplay';
import KeyValue from '../../../common/KeyValue';
import Loadable from '../../../common/Loadable';

interface Props {
  chainId: number;
  item: NftListingItem;
}

const ListingAsset = ({ item, chainId }: Props) => {
  const { result, loading, error } = useAsync(() => getNftListingItemTokenData(item, chainId), []);

  const { name, symbol } = result?.asset ?? {};
  const fullDisplay = (
    <div className="flex gap-2">
      <div>{name}</div>
      <div className="text-neutral-400 dark:text-neutral-500">{symbol}</div>
    </div>
  );

  const assetDisplay = name && symbol ? fullDisplay : name || symbol;

  return (
    <Loadable loading={loading} error={error}>
      <KeyValue>
        <AddressOrDisplay address={result?.asset?.address} display={assetDisplay} />
        {result?.specification}
      </KeyValue>
    </Loadable>
  );
};

export default ListingAsset;
