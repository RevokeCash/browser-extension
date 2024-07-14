import React from 'react';
import { useAsync } from 'react-async-hook';
import { Address } from 'viem';
import { getTokenData } from '../../../../lib/utils/tokens';
import { AddressOrDisplay } from '../../../common/AddressOrDisplay';
import Loadable from '../../../common/Loadable';
import { AssetDisplay } from '../../../common/AssetDisplay';

interface Props {
  chainId: number;
  address: Address;
}

// TODO: Add token logo
const AllowanceAsset = ({ address, chainId }: Props) => {
  const { result, loading, error } = useAsync(() => getTokenData(address, chainId), []);

  return (
    <Loadable loading={loading} error={error}>
      <AddressOrDisplay
        address={address}
        display={<AssetDisplay name={result?.name} symbol={result?.symbol} address={address} />}
      />
    </Loadable>
  );
};

export default AllowanceAsset;
