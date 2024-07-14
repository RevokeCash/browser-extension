import React from 'react';
import { useTranslations } from '../../../i18n';
import InfoBlock from './InfoBlock';

const BypassWarning = () => {
  const t = useTranslations();

  return <InfoBlock isWarning>{t('common.bypass')}</InfoBlock>;
};

export default BypassWarning;
