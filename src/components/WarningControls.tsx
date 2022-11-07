import React from 'react';
import Browser from 'webextension-polyfill';
import { useTranslation } from '../i18n';
import '../styles.css';
import Button from './Button';

interface Props {
  requestId: string;
  bypassed: boolean;
}

const WarningControls = ({ bypassed, requestId }: Props) => {
  const { t } = useTranslation();

  const respond = async (response: boolean) => {
    await Browser.runtime.sendMessage(undefined, { id: requestId, response });
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

// "confirm_allowance": {
//   "confirm": "You are about to approve an allowance on <0>{{hostname}}</0>!",
//   "bypassed": "This website bypassed the Revoke.cash confirmation process and is trying to request an allowance on <0>{{hostname}}</0>!",
//   "asset": "Asset",
//   "spender": "Spender"
// },
// "confirm_hash": {
//   "explanation": "This can be used to list NFTs for sale or authorize asset transfers.",
//   "confirm": "You are about to sign a hash on <0>{{hostname}}</0>!",
//   "bypassed": "This website bypassed the Revoke.cash confirmation process and is asking you to sign a hash on <0>{{hostname}}</0>!"
// },
// "confirm_listing": {
//   "confirm": "You are about to list an item for sale on <0>{{platform}}</0>!",
//   "bypassed": "This website bypassed the Revoke.cash confirmation process and is trying to list an item for sale on <0>{{platform}}</0>!",
//   "you_sell": "You sell",
//   "you_receive": "You receive (after fees)"
// }
