import React from 'react';
import ReactDOM from 'react-dom';
import Browser from 'webextension-polyfill';
import Button from '../components/Button';
import WarningText from '../components/WarningText';
import { useTranslation } from '../i18n';
import { WarningType } from '../lib/constants';
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
      <WarningText warningType={WarningType.HASH} bypassed={bypassed} hostname={hostname!} />
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
