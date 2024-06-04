import React from 'react';
import { Address } from 'viem';
import { shortenAddress } from '../../lib/utils/formatting';

interface Props {
  address?: Address;
  display?: React.ReactNode;
}

export const AddressOrDisplay = ({ display, address }: Props) => {
  return <div>{display || shortenAddress(address)}</div>;
};
