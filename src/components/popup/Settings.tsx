import React from 'react';
import { useColorTheme } from '../../hooks/useColorTheme';
import { getLocaleOption, useLocale, useTranslations } from '../../i18n';
import { WarningType, warningSettingKeys } from '../../lib/constants';
import BooleanSetting from './settings/BooleanSetting';
import SettingsNavigation from './settings/SettingsNavigation';

const Settings = () => {
  const t = useTranslations();
  const { locale } = useLocale();
  const { theme } = useColorTheme();

  return (
    <div className="flex flex-col justify-center items-center w-full gap-3">
      <div className="flex flex-col justify-center items-center w-full gap-px">
        <BooleanSetting
          storageKey={warningSettingKeys[WarningType.ALLOWANCE]}
          label={t('popup.settings.approvals')}
          defaultValue={true}
        />
        <BooleanSetting
          storageKey={warningSettingKeys[WarningType.LISTING]}
          label={t('popup.settings.listings')}
          defaultValue={true}
        />
        <BooleanSetting
          storageKey={warningSettingKeys[WarningType.HASH]}
          label={t('popup.settings.hash_signatures')}
          defaultValue={true}
        />
        <BooleanSetting
          storageKey={warningSettingKeys[WarningType.SUSPECTED_SCAM]}
          label={t('popup.settings.suspected_scams')}
          defaultValue={true}
        />
      </div>
      <div className="flex flex-col justify-center items-center w-full gap-px">
        <SettingsNavigation href="/language" label={t('popup.language.title')} value={getLocaleOption(locale).label} />
        <SettingsNavigation
          href="/color-theme"
          label={t('popup.color_theme.title')}
          value={t(`popup.color_theme.themes.${theme}`)}
        />
        <SettingsNavigation label={t('popup.about.title')} href="/about" />
      </div>
    </div>
  );
};

export default Settings;
