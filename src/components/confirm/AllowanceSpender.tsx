import React from 'react';
import { useAsync } from 'react-async-hook';
import { getChainExplorerUrl } from '../../lib/utils/chains';
import { addressToAppName } from '../../lib/utils/whois';
import Href from '../common/Href';
import Loadable from '../common/Loadable';

interface Props {
  chainId: number;
  address: string;
}

const AllowanceSpender = ({ address, chainId }: Props) => {
  const { result, loading } = useAsync(() => addressToAppName(address, chainId), []);
  const spenderDisplay = result || address;
  const explorerUrl = getChainExplorerUrl(chainId);

  return (
    <Loadable loading={loading}>
      <Href underline="always" href={`${explorerUrl}/address/${address}`}>
        {spenderDisplay}
      </Href>
    </Loadable>
  );
};

export default AllowanceSpender;
