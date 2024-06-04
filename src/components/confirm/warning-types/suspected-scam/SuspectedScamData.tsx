import React from 'react';
import { useTranslations } from '../../../../i18n';
import { SuspectedScamWarningData } from '../../../../lib/types';
import { getChainExplorerUrl } from '../../../../lib/utils/chains';
import { AddressOrDisplay } from '../../../common/AddressOrDisplay';
import KeyValue from '../../../common/KeyValue';
import MenuItemOrLink from '../../../common/MenuItemOrLink';

interface Props {
  data: SuspectedScamWarningData;
}

const SuspectedScamData = ({ data }: Props) => {
  const t = useTranslations();

  const explorerUrl = getChainExplorerUrl(data.chainId);

  return (
    <MenuItemOrLink size="small" href={explorerUrl ? `${explorerUrl}/address/${data.address}` : undefined}>
      <KeyValue>
        <div>{t('common.address')}</div>
        <AddressOrDisplay address={data.address} />
      </KeyValue>
    </MenuItemOrLink>
  );
};

export default SuspectedScamData;
