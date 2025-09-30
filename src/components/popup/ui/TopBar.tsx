import React from 'react';

const YELLOW = '#F6B74A';

const ICON_SRC = '/images/icon.svg';

export default function TopBar({ status = 'ON' }: { status?: 'ON' | 'OFF' }) {
  const isOn = status === 'ON';

  return (
    <div className="px-3 pt-3">
      <div className="w-full rounded-[10px] bg-[#0E0E0E] border border-[#1E1E1E] px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-7 w-7 rounded-md flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: 'rgba(246, 183, 74, 0.15)' }}
            >
              <img
                src={ICON_SRC}
                alt="Revoke icon"
                className="h-7 w-7"
                onError={(e) => {
                  (e.currentTarget as any).outerHTML =
                    '<span class="text-[12px] font-extrabold text-white leading-none">r</span>';
                }}
              />
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-[13px] font-semibold">revoke</span>
              <span className="text-[10px] text-neutral-400">by Revoke Cash and Fairside</span>
            </div>
          </div>

          <div className="flex items-center">
            <span className="text-[11px] font-semibold" style={{ color: isOn ? YELLOW : '#9CA3AF' }} aria-live="polite">
              {isOn ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
