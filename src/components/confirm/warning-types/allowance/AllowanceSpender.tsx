import React from 'react';
import { useAsync } from 'react-async-hook';
import { Address } from 'viem';
import { getSpenderData } from '../../../../lib/utils/whois';
import { AddressOrDisplay } from '../../../common/AddressOrDisplay';
import Loadable from '../../../common/Loadable';

interface Props {
  chainId: number;
  address: Address;
}

const AllowanceSpender = ({ address, chainId }: Props) => {
  const { result, loading, error } = useAsync(() => getSpenderData(address, chainId), []);
  const spenderDisplay = result?.name;

  return (
    <Loadable loading={loading} error={error}>
      <AddressOrDisplay address={address} display={spenderDisplay} />
    </Loadable>
  );
};

export default AllowanceSpender;
