import React from 'react';
import { useAsync } from 'react-async-hook';
import { ClipLoader } from 'react-spinners';
import Link from '../components/Link';
import { useTranslation } from '../i18n';
import { INFURA_API_KEY, WarningType } from '../lib/constants';
import { AllowanceWarningData } from '../lib/types';
import { getChainExplorerUrl, getChainProvider } from '../lib/utils/chains';
import { getTokenData } from '../lib/utils/tokens';
import { addressToAppName } from '../lib/utils/whois';
import '../styles.css';
import WarningText from './WarningText';

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

  const assetLoader = <ClipLoader size={10} color={'#000'} loading={loadingAsset} />;
  const spenderLoader = <ClipLoader size={10} color={'#000'} loading={loadingSpender} />;

  const assetLink = <Link href={`${explorerUrl}/address/${data.asset}`}>{assetDisplay}</Link>;
  const spenderLink = <Link href={`${explorerUrl}/address/${data.asset}`}>{spenderDisplay}</Link>;

  return (
    <div>
      <WarningText warningType={WarningType.ALLOWANCE} bypassed={data.bypassed} hostname={data.hostname} />
      <div className="flex flex-col items-center">
        <div className="font-bold text-lg leading-tight">{t('confirm_allowance.asset')}</div>
        <div>{loadingAsset ? assetLoader : assetLink}</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="font-bold text-lg leading-tight">{t('confirm_allowance.spender')}</div>
        <div>{loadingSpender ? spenderLoader : spenderLink}</div>
      </div>
    </div>
  );
};

export default AllowanceInfo;
