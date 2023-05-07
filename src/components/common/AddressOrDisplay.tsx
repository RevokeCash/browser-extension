import React from 'react';
import { getChainExplorerUrl } from '../../lib/utils/chains';
import Href from './Href';

interface Props {
  chainId: number;
  address?: string;
  display?: string;
}

export const AddressOrDisplay = ({ display, address, chainId }: Props) => {
  const explorerUrl = getChainExplorerUrl(chainId);

  if (!explorerUrl || !address) {
    return <div>{display || address}</div>;
  }

  return (
    <div>
      <Href underline="always" href={`${explorerUrl}/address/${address}`}>
        {display || address}
      </Href>
    </div>
  );
};
