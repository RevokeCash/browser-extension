import React from 'react';
import { useTranslations } from '../../i18n';
import { SuspectedScamWarningData } from '../../lib/types';
import { AddressOrDisplay } from '../common/AddressOrDisplay';

interface Props {
  data: SuspectedScamWarningData;
}

const AddressInfo = ({ data }: Props) => {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center">
      <div className="font-bold text-lg leading-tight">{t('common.address')}</div>
      <AddressOrDisplay address={data.address} chainId={data.chainId} />
    </div>
  );
};

export default AddressInfo;
