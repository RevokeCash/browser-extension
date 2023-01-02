import React from 'react';
import { Trans } from '../../i18n';
import { getChainName } from '../../lib/utils/chains';

interface Props {
  size: 'small' | 'large';
  chainId?: number;
}

const Header = ({ size, chainId }: Props) => {
  const chainName = chainId && getChainName(chainId);

  return (
    <div className={size === 'small' ? 'w-[200px]' : 'w-[360px]'}>
      <img
        src="/images/revoke.svg"
        alt="revoke.cash logo"
        width={size === 'small' ? '200' : '360'}
        className="filter dark:invert"
      />
      {chainName && (
        <div className="text-center text-xs">
          <Trans i18nKey="common.connected_to" values={{ chainName }} />
        </div>
      )}
    </div>
  );
};

export default Header;
