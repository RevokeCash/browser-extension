import React from 'react';
import { getChainName } from '../../lib/utils/chains';
import Logo from '../common/Logo';

interface Props {
  size: 'small' | 'large';
  chainId?: number;
}

const Header = ({ size, chainId }: Props) => {
  const chainName = chainId !== undefined ? getChainName(chainId) : undefined;

  return (
    <div className={'flex items-center justify-between w-full h-16 py-3 px-4'}>
      <img className="h-4" src="/images/revoke-wordmark-orange.svg" alt="Revoke.cash logo" />
      {/* TODO: Add connected address to UI */}
      {chainName ? (
        <div className="flex items-center gap-1">
          <Logo src="/" alt={chainName} border />
          <div className="text-sm">{chainName}</div>
        </div>
      ) : null}
    </div>
  );
};

export default Header;
