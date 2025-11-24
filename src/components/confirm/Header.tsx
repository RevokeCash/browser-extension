import React from 'react';
import { getChainLogo, getChainName } from '../../lib/chains/chains';
import Logo from '../common/Logo';
import { useTranslations } from '../../i18n';

interface Props {
  size: 'small' | 'large';
  chainId?: number;
}

const Header = ({ size, chainId }: Props) => {
  const t = useTranslations();
  const chainName = chainId !== undefined ? getChainName(chainId) : undefined;
  const chainLogo = chainId !== undefined ? getChainLogo(chainId) : undefined;

  return (
    <div className={'flex items-center justify-between w-full h-16 py-3 px-4'}>
      <img className="h-5" src="/images/revoke-wordmark-orange.svg" alt={t('common.logo_alt')} />
      {/* TODO: Add connected address to UI */}
      {chainName ? (
        <div className="flex items-center gap-1">
          {/* TODO: Improve the logo handling to use https://github.com/ethereum-lists/chains/tree/master/_data/icons as a fallback */}
          {chainLogo ? <Logo src={chainLogo} alt={chainName} /> : null}
          <div className="text-sm">{chainName}</div>
        </div>
      ) : null}
    </div>
  );
};

export default Header;
