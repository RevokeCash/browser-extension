import React from 'react';
import { useAsync } from 'react-async-hook';
import { Address } from 'viem';
import { getSpenderData } from '../../lib/utils/whois';
import { AddressOrDisplay } from '../common/AddressOrDisplay';
import Loadable from '../common/Loadable';

interface Props {
  chainId: number;
  address: Address;
}

const AllowanceSpender = ({ address, chainId }: Props) => {
  const { result, loading } = useAsync(() => getSpenderData(address, chainId), []);
  const spenderDisplay = result?.name || address;

  return (
    <Loadable loading={loading}>
      <AddressOrDisplay address={address} display={spenderDisplay} chainId={chainId} />
    </Loadable>
  );
};

export default AllowanceSpender;
