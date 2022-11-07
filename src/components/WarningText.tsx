import React from 'react';
import { Trans, useTranslation } from '../i18n';
import { WarningType } from '../lib/constants';

interface Props {
  type: WarningType;
  bypassed: boolean;
  hostname?: string;
  platform?: string;
}

const WarningText = ({ type, bypassed, hostname, platform }: Props) => {
  const { t } = useTranslation();

  const getAfterText = (warningType: WarningType, bypassed: boolean) => {
    if (warningType === WarningType.HASH) {
      return `${t('confirm_hash.explanation')} ${t('common.trust_website')}`;
    }

    return bypassed ? t('common.proceed_with_caution') : t('common.intention');
  };

  const beforeText = bypassed && t('common.warning');
  const afterText = getAfterText(type, bypassed);
  const i18nKey = `confirm_${type}.${bypassed ? 'bypassed' : 'confirm'}`;

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
