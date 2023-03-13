import React from 'react';
import { useAsync } from 'react-async-hook';
import { INFURA_API_KEY } from '../../lib/constants';
import { getChainExplorerUrl, getChainProvider } from '../../lib/utils/chains';
import { getTokenData } from '../../lib/utils/tokens';
import Href from '../common/Href';
import Loadable from '../common/Loadable';

interface Props {
  chainId: number;
  address: string;
}

const AllowanceAsset = ({ address, chainId }: Props) => {
  const provider = getChainProvider(chainId, INFURA_API_KEY);
  const { result, loading } = useAsync(() => getTokenData(address, provider), []);
  const { name, symbol } = result ?? {};
  const assetDisplay = name && symbol ? `${name} (${symbol})` : name || symbol || address;
  const explorerUrl = getChainExplorerUrl(chainId);

  return (
    <Loadable loading={loading}>
      <div>
        <Href underline="always" href={`${explorerUrl}/address/${address}`}>
          {assetDisplay}
        </Href>
      </div>
    </Loadable>
  );
};

export default AllowanceAsset;
