import React from 'react';
import Browser from 'webextension-polyfill';
import { useTranslation } from '../../i18n';
import Button from '../common/Button';

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
