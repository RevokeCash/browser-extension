import React from 'react';
import { useTranslations } from '../../i18n';

const Header = () => {
  const t = useTranslations();
  return (
    <div className={'flex items-center w-60 py-2 grow'}>
      <img src="/images/revoke-wordmark-orange.svg" alt={t('common.logo_alt')} />
    </div>
  );
};

export default Header;
