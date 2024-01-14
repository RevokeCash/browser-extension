import React from 'react';
import { useAsync } from 'react-async-hook';
import { Address } from 'viem';
import { getTokenData } from '../../lib/utils/tokens';
import { AddressOrDisplay } from '../common/AddressOrDisplay';
import Loadable from '../common/Loadable';

interface Props {
  chainId: number;
  address: Address;
}

const AllowanceAsset = ({ address, chainId }: Props) => {
  const { result, loading, error } = useAsync(() => getTokenData(address, chainId), []);

  const { name, symbol } = result ?? {};
  const assetDisplay = name && symbol ? `${name} (${symbol})` : name || symbol || address;

  return (
    <Loadable loading={loading} error={error}>
      <AddressOrDisplay address={address} display={assetDisplay} chainId={chainId} />
    </Loadable>
  );
};

export default AllowanceAsset;
