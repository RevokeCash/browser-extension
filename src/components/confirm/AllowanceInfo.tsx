import React from 'react';
import { useTranslation } from '../../i18n';
import { AllowanceWarningData } from '../../lib/types';
import AllowanceAsset from './AllowanceAsset';
import AllowanceSpender from './AllowanceSpender';

interface Props {
  data: AllowanceWarningData;
}

const AllowanceInfo = ({ data }: Props) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="font-bold text-lg leading-tight">{t('confirm_allowance.asset')}</div>
        {data.assets.map((address, i) => (
          <AllowanceAsset key={`${address}-${i}`} address={address} chainId={data.chainId} />
        ))}
      </div>
      <div className="flex flex-col items-center">
        <div className="font-bold text-lg leading-tight">{t('confirm_allowance.spender')}</div>
        <AllowanceSpender address={data.spender} chainId={data.chainId} />
      </div>
    </>
  );
};

export default AllowanceInfo;
