import React from 'react';
import { getLocaleOption, localeOptions, useLocale, useTranslations } from '../../../i18n';
import SelectPage from '../settings/SelectPage';

const LanguageSelectPage = () => {
  const t = useTranslations();
  const { locale, setLocale } = useLocale();

  return (
    <SelectPage
      title={t('popup.language.title')}
      options={localeOptions}
      selected={getLocaleOption(locale)}
      select={(option) => setLocale(option.value)}
    />
  );
};

export default LanguageSelectPage;
