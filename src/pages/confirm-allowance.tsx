import React from 'react';
import ReactDOM from 'react-dom';
import Browser from 'webextension-polyfill';
import Button from '../components/Button';
import Link from '../components/Link';
import { Trans, useTranslation } from '../i18n';
import { getExplorerUrl } from '../lib/utils';
import '../styles.css';

const ConfirmAllowance = () => {
  const { t } = useTranslation();

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const asset = params.get('asset');
  const chainId = Number(params.get('chainId'));
  const spender = params.get('spender');
  const name = params.get('name');
  const symbol = params.get('symbol');
  const spenderName = params.get('spenderName');
  const explorerUrl = getExplorerUrl(chainId);
  const bypassed = params.get('bypassed') === 'true';
  const hostname = params.get('hostname');

  const respond = async (response: boolean) => {
    await Browser.runtime.sendMessage(undefined, { id, response });
    window.close();
  };

  const confirm = () => respond(true);
  const reject = () => respond(false);

  const assetString = name && symbol ? `${name} (${symbol})` : name || symbol || asset;

  return (
    <div className="flex flex-col gap-1 justify-center items-center w-full h-screen p-2">
      <div className="w-[360px]">
        <img src="/images/revoke.svg" alt="revoke.cash logo" width="360" />
      </div>
      {bypassed ? (
        <div className="w-[400px] text-center">
          <span className="font-bold uppercase">{t('common.warning')}</span>:{' '}
          <Trans
            i18nKey="confirm_allowance.bypassed"
            values={{ hostname }}
            components={[<span className="font-bold" />]}
          />{' '}
          {t('common.proceed_with_caution')}
        </div>
      ) : (
        <div className="w-[400px] text-center">
          <Trans
            i18nKey="confirm_allowance.confirm"
            values={{ hostname }}
            components={[<span className="font-bold" />]}
          />{' '}
          {t('common.intention')}
        </div>
      )}
      <div className="flex flex-col items-center">
        <div className="font-bold text-lg leading-tight">{t('confirm_allowance.asset')}</div>
        <div>
          <Link href={`${explorerUrl}/address/${asset}`}>{assetString}</Link>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="font-bold text-lg leading-tight">{t('confirm_allowance.spender')}</div>
        <div>
          <Link href={`${explorerUrl}/address/${spender}`}>{spenderName || spender}</Link>
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
    <ConfirmAllowance />
  </React.StrictMode>,
  document.getElementById('root')
);
