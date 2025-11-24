import React from 'react';
import { useTranslations } from '../../../i18n';

const YELLOW = '#F6B74A';

export default function Tabs({
  active,
  onChange,
}: {
  active: 'features' | 'approvals' | 'settings';
  onChange: (t: 'features' | 'approvals' | 'settings') => void;
}) {
  const t = useTranslations();
  const Tab = ({ id, label }: { id: 'features' | 'approvals' | 'settings'; label: string }) => {
    const is = active === id;
    return (
      <button
        onClick={() => onChange(id)}
        className={`
          relative flex-1 py-2
          text-[13px] font-medium
          text-center
          ${is ? 'text-white' : 'text-neutral-300 hover:text-white'}
        `}
      >
        {label}
        {is && (
          <span
            className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full"
            style={{ backgroundColor: YELLOW }}
          />
        )}
      </button>
    );
  };

  return (
    <div className="px-3 mt-2 border-b border-[#212121]">
      <div className="flex w-full">
        <Tab id="approvals" label={t('popup.tabs.approvals')} />
        <Tab id="features" label={t('popup.tabs.features')} />
        {/* <Tab id="settings" label={t('popup.tabs.settings')} /> */}
      </div>
    </div>
  );
}
