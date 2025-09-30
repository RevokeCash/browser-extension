import React from 'react';

const YELLOW = '#F6B74A';

export default function Tabs({
  active,
  onChange,
}: {
  active: 'features' | 'approvals' | 'settings';
  onChange: (t: 'features' | 'approvals' | 'settings') => void;
}) {
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
        <Tab id="features" label="Features" />
        <Tab id="approvals" label="Approvals" />
        <Tab id="settings" label="Settings" />
      </div>
    </div>
  );
}
