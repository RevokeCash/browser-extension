import React from 'react';
import { useColorTheme } from '../../hooks/useColorTheme';
import { useTranslations } from '../../i18n';
import { getChainName } from '../../lib/utils/chains';

interface Props {
  size: 'small' | 'large';
  chainId?: number;
}

const Header = ({ size, chainId }: Props) => {
  const t = useTranslations();
  const { darkMode } = useColorTheme();
  const chainName = chainId !== undefined ? getChainName(chainId) : undefined;

  return (
    <div className={'w-60 py-8'}>
      <img src="/images/revoke-wordmark-orange.svg" alt="Revoke.cash logo" />
      {chainName && <div className="text-center text-xs">{t('common.connected_to', { chainName })}</div>}
    </div>
  );
};

export default Header;
