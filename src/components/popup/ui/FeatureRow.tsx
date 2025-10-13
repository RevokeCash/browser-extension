import React from 'react';
import useBrowserStorage from '../../../hooks/useBrowserStorage';
import { Row } from './FeatureCard';
import DisableCoverageModal from './DisableCoverageModal';

const YELLOW = '#F6B74A';

export default function FeatureRowItem({ row, darkMode, isLast }: { row: Row; darkMode: boolean; isLast: boolean }) {
  const [value, setValue] = useBrowserStorage<boolean>('local', row.storageKey, row.defaultValue);
  const [showDisable, setShowDisable] = React.useState(false);

  if (value === undefined) return null;

  const isCoverage = row.id === 'COVERAGE';
  const isOff = isCoverage && !value;
  const desc = isCoverage && isOff ? 'Your theft safety net is OFF. Turn ON to receive full benefits' : row.desc;

  const requestToggle = (next: boolean) => {
    // Coverage → turning OFF → ask for confirmation
    if (isCoverage && value === true && next === false) {
      setShowDisable(true);
      return;
    }
    // Otherwise apply immediately
    setValue(next);
  };

  const onSwitchClick = () => requestToggle(!value);

  const onSwitchKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      requestToggle(!value);
    }
  };

  const confirmDisable = () => {
    setValue(false);
    setShowDisable(false);
  };

  const cancelDisable = () => {
    // Keep it ON
    setShowDisable(false);
  };

  return (
    <>
      <div
        className={`py-3 px-3 border rounded-[8px] transition-colors ${
          isCoverage && isOff ? 'border-[#B71C1C]' : 'border-transparent'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col flex-[0.9] min-w-0">
            <div className="text-[13px] font-semibold text-neutral-100 break-words">{row.title}</div>
            <div
              className={`text-[12px] leading-snug break-words ${
                isCoverage && isOff ? 'text-[#ef4444]' : 'text-neutral-400'
              }`}
            >
              {desc}
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={!!value}
            aria-label={row.title}
            onClick={onSwitchClick}
            onKeyDown={onSwitchKeyDown}
            className="relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              width: 44,
              height: 24,
              background: value ? YELLOW : isCoverage ? '#B71C1C' : '#3F3F46',
              boxShadow: darkMode ? 'none' : undefined,
            }}
          >
            <span
              className="absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full transition-transform shadow"
              style={{
                background: '#FFFFFF',
                transform: value ? 'translateX(20px)' : 'translateX(0px)',
              }}
            />
          </button>
        </div>

        {!isLast && <div className="mt-3 h-px bg-[#232323]" />}
      </div>

      <DisableCoverageModal open={showDisable} onCancel={cancelDisable} onConfirm={confirmDisable} />
    </>
  );
}
