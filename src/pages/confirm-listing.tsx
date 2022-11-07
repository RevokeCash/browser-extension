import React from 'react';
import ReactDOM from 'react-dom';
import Browser from 'webextension-polyfill';
import Button from '../components/Button';
import Link from '../components/Link';
import { Trans, useTranslation } from '../i18n';
import { getChainExplorerUrl } from '../lib/utils/chains';
import '../styles.css';

const ConfirmListing = () => {
  const { t } = useTranslation();
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const offerAssets = JSON.parse(params.get('offerAssets')!);
  const considerationAssets = JSON.parse(params.get('considerationAssets')!);
  const platform = params.get('platform');
  const chainId = Number(params.get('chainId'));
  const explorerUrl = getChainExplorerUrl(chainId);
  const bypassed = params.get('bypassed') === 'true';

  const respond = async (response: boolean) => {
    await Browser.runtime.sendMessage(undefined, { id, response });
    window.close();
  };

  const confirm = () => respond(true);
  const reject = () => respond(false);

  return (
    <div className="flex flex-col gap-1 justify-center items-center w-full h-screen p-2">
      <div className="w-[360px]">
        <img src="/images/revoke.svg" alt="revoke.cash logo" width="360" />
      </div>
      {bypassed ? (
        <div className="w-[400px] text-center">
          <span className="font-bold uppercase">{t('common.warning')}</span>:{' '}
          <Trans
            i18nKey="confirm_listing.bypassed"
            values={{ platform }}
            components={[<span className="font-bold" />]}
          />{' '}
          {t('common.proceed_with_caution')}
        </div>
      ) : (
        <div className="w-[400px] text-center">
          <Trans
            i18nKey="confirm_listing.confirm"
            values={{ platform }}
            components={[<span className="font-bold" />]}
          />{' '}
          {t('common.intention')}
        </div>
      )}
      <div className="flex flex-col items-center">
        <div className="font-bold text-lg leading-tight">{t('confirm_listing.you_sell')}</div>
        <div className="flex flex-col items-center">
          {offerAssets.map((asset: any) => (
            <div key={`offer: ${JSON.stringify(asset)}`}>
              {asset.asset ? (
                <Link href={`${explorerUrl}/address/${asset.asset}`}>{asset.display}</Link>
              ) : (
                asset.display
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="font-bold text-lg leading-tight">{t('confirm_listing.you_receive')}</div>
        <div className="flex flex-col items-center">
          {considerationAssets.map((asset: any) => (
            <div key={`consideration: ${JSON.stringify(asset)}`}>
              {asset.asset ? (
                <Link href={`${explorerUrl}/address/${asset.asset}`}>{asset.display}</Link>
              ) : (
                asset.display
              )}
            </div>
          ))}
        </div>
      </div>
      {bypassed ? (
        <div className="flex gap-1 pt-2">
          <Button onClick={() => window.close()}>{t('common.dismiss')}</Button>
        </div>
      ) : (
        <div className="flex gap-1 pt-2">
          <Button onClick={reject} secondary>
            {t('common.reject')}
          </Button>
          <Button onClick={confirm}>{t('common.continue')}</Button>
        </div>
      )}
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <ConfirmListing />
  </React.StrictMode>,
  document.getElementById('root')
);
