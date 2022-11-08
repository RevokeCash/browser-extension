import React from 'react';
import Browser from 'webextension-polyfill';
import { useTranslation } from '../i18n';
import Button from './Button';

interface Props {
  requestId: string;
  bypassed: boolean;
}

const WarningControls = ({ bypassed, requestId }: Props) => {
  const { t } = useTranslation();

  const respond = async (data: boolean) => {
    await Browser.runtime.sendMessage(undefined, { requestId, data });
    window.close();
  };

  const confirm = () => respond(true);
  const reject = () => respond(false);

  return (
    <div className="flex gap-1 pt-2">
      {bypassed ? (
        <Button onClick={() => window.close()}>{t('common.dismiss')}</Button>
      ) : (
        <>
          <Button onClick={reject} secondary>
            {t('common.reject')}
          </Button>
          <Button onClick={confirm}>{t('common.continue')}</Button>
        </>
      )}
    </div>
  );
};

export default WarningControls;
