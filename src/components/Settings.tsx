import React from 'react';
import { useTranslation } from 'react-i18next';
import BooleanSetting from './BooleanSetting';

const Settings = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col justify-center items-center w-full gap-1">
      <BooleanSetting storageKey="settings:warnOnApproval" label={t('popup.settings.approvals')} defaultValue={true} />
      <BooleanSetting storageKey="settings:warnOnListing" label={t('popup.settings.listings')} defaultValue={true} />
      <BooleanSetting
        storageKey="settings:warnOnHashSignatures"
        label={t('popup.settings.hash_signatures')}
        defaultValue={true}
      />
    </div>
  );
};

export default Settings;
