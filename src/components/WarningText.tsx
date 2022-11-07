import React from 'react';
import { Trans, useTranslation } from '../i18n';
import { WarningType } from '../lib/constants';
import '../styles.css';

interface Props {
  warningType: WarningType;
  bypassed: boolean;
  hostname?: string;
  platform?: string;
}

const WarningText = ({ warningType, bypassed, hostname, platform }: Props) => {
  const { t } = useTranslation();

  const getAfterText = (warningType: WarningType, bypassed: boolean) => {
    if (warningType === WarningType.HASH) {
      return `${t('confirm_hash.explanation')} ${t('common.trust_website')}`;
    }

    return bypassed ? t('common.proceed_with_caution') : t('common.intention');
  };

  const beforeText = bypassed && t('common.warning');
  const afterText = getAfterText(warningType, bypassed);
  const i18nKey = `confirm_${warningType}.${bypassed ? 'bypassed' : 'confirm'}`;

  return (
    <div>
      <div className="w-[400px] text-center">
        {beforeText && <span className="font-bold uppercase">{t('common.warning')}</span>}
        {beforeText && ': '}
        <Trans i18nKey={i18nKey} values={{ hostname, platform }} components={[<span className="font-bold" />]} />{' '}
        {afterText}
      </div>
    </div>
  );
};

export default WarningText;

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
