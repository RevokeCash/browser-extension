import React from 'react';
import { useAsync } from 'react-async-hook';
import { getChainProvider } from '../../lib/utils/chains';
import { getTokenData } from '../../lib/utils/tokens';
import { AddressOrDisplay } from '../common/AddressOrDisplay';
import Loadable from '../common/Loadable';

interface Props {
  chainId: number;
  address: string;
}

const AllowanceAsset = ({ address, chainId }: Props) => {
  const provider = getChainProvider(chainId);
  const { result, loading } = useAsync(() => getTokenData(address, provider), []);

  const { name, symbol } = result ?? {};
  const assetDisplay = name && symbol ? `${name} (${symbol})` : name || symbol || address;

  return (
    <Loadable loading={loading}>
      <AddressOrDisplay address={address} display={assetDisplay} chainId={chainId} />
    </Loadable>
  );
};

export default AllowanceAsset;
