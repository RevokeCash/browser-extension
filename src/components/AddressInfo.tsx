import React from 'react';
import { useTranslation } from '../i18n';
import { SuspectedScamWarningData } from '../lib/types';
import { getChainExplorerUrl } from '../lib/utils/chains';
import Link from './Link';

interface Props {
  data: SuspectedScamWarningData;
}

const AddressInfo = ({ data }: Props) => {
  const { t } = useTranslation();

  const explorerUrl = getChainExplorerUrl(data.chainId);

  return (
    <div className="flex flex-col items-center">
      <div className="font-bold text-lg leading-tight">{t('common.address')}</div>
      <Link href={`${explorerUrl}/address/${data.address}`}>{data.address}</Link>
    </div>
  );
};

export default AddressInfo;
