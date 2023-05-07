import React from 'react';
import { useAsync } from 'react-async-hook';
import { addressToAppName } from '../../lib/utils/whois';
import { AddressOrDisplay } from '../common/AddressOrDisplay';
import Loadable from '../common/Loadable';

interface Props {
  chainId: number;
  address: string;
}

const AllowanceSpender = ({ address, chainId }: Props) => {
  const { result, loading } = useAsync(() => addressToAppName(address, chainId), []);
  const spenderDisplay = result || address;

  return (
    <Loadable loading={loading}>
      <AddressOrDisplay address={address} display={spenderDisplay} chainId={chainId} />
    </Loadable>
  );
};

export default AllowanceSpender;
