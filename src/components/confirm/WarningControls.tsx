import React from 'react';
import { Hash } from 'viem';
import Browser from 'webextension-polyfill';
import { useTranslations } from '../../i18n';
import Button from '../common/Button';

interface Props {
  requestId: Hash;
  bypassed: boolean;
}

const WarningControls = ({ bypassed, requestId }: Props) => {
  const t = useTranslations();

  const respond = async (data: boolean) => {
    try {
      await Browser.runtime.sendMessage(undefined, { requestId, data });
    } finally {
      window.close();
    }
  };

  const confirm = () => respond(true);
  const reject = () => respond(false);

  return (
    <div className="flex gap-1 pt-2">
      {bypassed ? (
        <Button style="primary" size="md" onClick={() => window.close()}>
          {t('common.dismiss')}
        </Button>
      ) : (
        <>
          <Button onClick={reject} style="secondary" size="md">
            {t('common.reject')}
          </Button>
          <Button style="primary" size="md" onClick={confirm}>
            {t('common.continue')}
          </Button>
        </>
      )}
    </div>
  );
};

export default WarningControls;
