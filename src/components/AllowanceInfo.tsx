import React from 'react';
import { useAsync } from 'react-async-hook';
import Link from '../components/Link';
import { useTranslation } from '../i18n';
import { INFURA_API_KEY } from '../lib/constants';
import { AllowanceWarningData } from '../lib/types';
import { getChainExplorerUrl, getChainProvider } from '../lib/utils/chains';
import { getTokenData } from '../lib/utils/tokens';
import { addressToAppName } from '../lib/utils/whois';
import Loadable from './Loadable';

interface Props {
  data: AllowanceWarningData;
}

const AllowanceInfo = ({ data }: Props) => {
  const { t } = useTranslation();

  const provider = getChainProvider(data.chainId, INFURA_API_KEY);
  const explorerUrl = getChainExplorerUrl(data.chainId);

  const { result: assetData, loading: loadingAsset } = useAsync(() => getTokenData(data.asset, provider), []);
  const { result: spenderName, loading: loadingSpender } = useAsync(
    () => addressToAppName(data.spender, data.chainId),
    []
  );

  const { name, symbol } = assetData ?? {};
  const assetDisplay = name && symbol ? `${name} (${symbol})` : name || symbol || data.asset;
  const spenderDisplay = spenderName || data.spender;

  return (
    <div>
      <div className="flex flex-col items-center">
        <div className="font-bold text-lg leading-tight">{t('confirm_allowance.asset')}</div>
        <Loadable loading={loadingAsset}>
          <Link href={`${explorerUrl}/address/${data.asset}`}>{assetDisplay}</Link>
        </Loadable>
      </div>
      <div className="flex flex-col items-center">
        <div className="font-bold text-lg leading-tight">{t('confirm_allowance.spender')}</div>
        <Loadable loading={loadingSpender}>
          <Link href={`${explorerUrl}/address/${data.spender}`}>{spenderDisplay}</Link>
        </Loadable>
      </div>
    </div>
  );
};

export default AllowanceInfo;
