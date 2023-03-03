import React from 'react';
import { useTranslation } from '../../i18n';
import { warningSettingKeys, WarningType } from '../../lib/constants';
import BooleanSetting from './BooleanSetting';
import ColorThemeSelect from './ColorThemeSelect';
import LanguageSelect from './LanguageSelect';

const Settings = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col justify-center items-center w-full gap-2">
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
      <div className="flex gap-2">
        <LanguageSelect />
        <ColorThemeSelect />
      </div>
    </div>
  );
};

export default Settings;
