import React from 'react';
import { useTranslation } from '../../i18n';
import { SuspectedScamWarningData } from '../../lib/types';
import { getChainExplorerUrl } from '../../lib/utils/chains';
import Href from '../common/Href';

interface Props {
  data: SuspectedScamWarningData;
}

const AddressInfo = ({ data }: Props) => {
  const { t } = useTranslation();

  const explorerUrl = getChainExplorerUrl(data.chainId);

  return (
    <div className="flex flex-col items-center">
      <div className="font-bold text-lg leading-tight">{t('common.address')}</div>
      <Href underline="always" href={`${explorerUrl}/address/${data.address}`}>
        {data.address}
      </Href>
    </div>
  );
};

export default AddressInfo;
