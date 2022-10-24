import React from 'react';
import ReactDOM from 'react-dom';
import { Trans, useTranslation } from 'react-i18next';
import Browser from 'webextension-polyfill';
import Button from '../components/Button';
import '../i18n/config';
import '../styles.css';

const ConfirmHashSignature = () => {
  const { t } = useTranslation();

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const bypassed = params.get('bypassed') === 'true';
  const hostname = params.get('hostname');

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
          <Trans i18nKey="confirm_hash.bypassed" values={{ hostname }} components={[<span className="font-bold" />]} />{' '}
          {t('confirm_hash.explanation')} {t('common.trust_website')}
        </div>
      ) : (
        <div className="w-[400px] text-center">
          <Trans i18nKey="confirm_hash.confirm" values={{ hostname }} components={[<span className="font-bold" />]} />{' '}
          {t('confirm_hash.explanation')} {t('common.trust_website')}
        </div>
      )}
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
    <ConfirmHashSignature />
  </React.StrictMode>,
  document.getElementById('root')
);
