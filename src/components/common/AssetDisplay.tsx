import React from 'react';
import { Address } from 'viem';
import { shortenAddress } from '../../lib/utils/formatting';
import { useTranslations } from '../../i18n';

interface Props {
  name?: string;
  symbol?: string;
  address?: Address;
}

export const AssetDisplay = ({ name, symbol, address }: Props) => {
  const t = useTranslations();

  const primaryDisplay = name || symbol || t('common.unknown_asset');
  const secondaryDisplay = name ? symbol : symbol ? undefined : shortenAddress(address);

  return (
    <div className="flex gap-2">
      <div>{primaryDisplay}</div>
      <div className="text-neutral-400 dark:text-neutral-500">{secondaryDisplay}</div>
    </div>
  );
};
