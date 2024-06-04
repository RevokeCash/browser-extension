import React from 'react';
import { useAsync } from 'react-async-hook';
import { Address } from 'viem';
import { getTokenData } from '../../../../lib/utils/tokens';
import { AddressOrDisplay } from '../../../common/AddressOrDisplay';
import Loadable from '../../../common/Loadable';

interface Props {
  chainId: number;
  address: Address;
}

// TODO: Add token logo
const AllowanceAsset = ({ address, chainId }: Props) => {
  const { result, loading, error } = useAsync(() => getTokenData(address, chainId), []);

  const { name, symbol } = result ?? {};
  const fullDisplay = (
    <div className="flex gap-2">
      <div>{name}</div>
      <div className="text-neutral-400 dark:text-neutral-500">{symbol}</div>
    </div>
  );
  const assetDisplay = name && symbol ? fullDisplay : name || symbol;

  return (
    <Loadable loading={loading} error={error}>
      <AddressOrDisplay address={address} display={assetDisplay} />
    </Loadable>
  );
};

export default AllowanceAsset;
