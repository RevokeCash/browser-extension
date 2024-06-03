import React from 'react';
import { useTranslations } from '../../i18n';
import { getChainName } from '../../lib/utils/chains';

interface Props {
  size: 'small' | 'large';
  chainId?: number;
}

const Header = ({ size, chainId }: Props) => {
  const t = useTranslations();
  const chainName = chainId !== undefined ? getChainName(chainId) : undefined;

  return (
    <div className={size === 'small' ? 'w-60' : 'w-92'}>
      <img src="/images/revoke.svg" alt="Revoke.cash logo" className="filter dark:invert" />
      {chainName && <div className="text-center text-xs">{t('common.connected_to', { chainName })}</div>}
    </div>
  );
};

export default Header;
