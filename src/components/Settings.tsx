import React from 'react';
import BooleanSetting from './BooleanSetting';

const Settings = () => {
  return (
    <div className="flex flex-col justify-center items-center w-full gap-1">
      <BooleanSetting storageKey="settings:warnOnApproval" label="Warn on approvals" defaultValue={true} />
      <BooleanSetting storageKey="settings:warnOnListing" label="Warn on NFT listings" defaultValue={true} />
    </div>
  );
}

export default Settings;
