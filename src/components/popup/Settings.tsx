import React from 'react';
import { useTranslation } from '../../i18n';
import BooleanSetting from './BooleanSetting';
import ColorThemeSelect from './ColorThemeSelect';
import LanguageSelect from './LanguageSelect';

const Settings = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col justify-center items-center w-full gap-2">
      <BooleanSetting storageKey="settings:warnOnApproval" label={t('popup.settings.approvals')} defaultValue={true} />
      <BooleanSetting storageKey="settings:warnOnListing" label={t('popup.settings.listings')} defaultValue={true} />
      <BooleanSetting
        storageKey="settings:warnOnHashSignatures"
        label={t('popup.settings.hash_signatures')}
        defaultValue={true}
      />
      <BooleanSetting
        storageKey="settings:warnOnSuspectedScams"
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
