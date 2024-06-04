import React from 'react';
import { useTranslations } from 'use-intl';
import InfoBlock from './InfoBlock';

const BypassWarning = () => {
  const t = useTranslations();

  return <InfoBlock isWarning>{t('common.bypass')}</InfoBlock>;
};

export default BypassWarning;
