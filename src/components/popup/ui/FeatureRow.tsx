import React from 'react';
import Browser from 'webextension-polyfill';
import useBrowserStorage from '../../../hooks/useBrowserStorage';
import { Row } from './FeatureCard';
import DisableCoverageModal from './DisableCoverageModal';
import { logConfigChange } from '../../../logs/extensionLogs';
import { useTranslations } from '../../../i18n';

const YELLOW = '#F6B74A';
const ZERO_ADDR = '0x0' as const;

async function getLastKnownUserAddress(): Promise<`0x${string}`> {
  try {
    const { fs_last_user_address } = await Browser.storage.local.get('fs_last_user_address');
    if (typeof fs_last_user_address === 'string' && /^0x[0-9a-fA-F]{40}$/.test(fs_last_user_address)) {
      return fs_last_user_address as `0x${string}`;
    }
  } catch {}
  return ZERO_ADDR;
}

export default function FeatureRowItem({ row, darkMode, isLast }: { row: Row; darkMode: boolean; isLast: boolean }) {
  const t = useTranslations();
  const [value, setValue] = useBrowserStorage<boolean>('local', row.storageKey, row.defaultValue);
  const [showDisable, setShowDisable] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);

  if (value === undefined) return null;

  const isCoverage = row.id === 'COVERAGE';
  const isOff = isCoverage && !value;
  const desc = isCoverage && isOff ? t('popup.features.coverage_off_warning') : row.desc;

  const logChange = React.useCallback(
    async (prevVal: boolean, nextVal: boolean) => {
      try {
        const userAddress = await getLastKnownUserAddress();
        await logConfigChange(userAddress, {
          url: location.href,
          configKey: row.storageKey,
          previousValue: prevVal,
          newValue: nextVal,
        });
      } catch {}
    },
    [row.storageKey],
  );

  const applyToggle = async (next: boolean) => {
    const prev = !!value;
    setValue(next);
    logChange(prev, next);
  };

  const requestToggle = (next: boolean) => {
    // Coverage → turning OFF → ask for confirmation
    if (isCoverage && value === true && next === false) {
      setShowDisable(true);
      return;
    }
    // Otherwise apply immediately
    applyToggle(next);
  };

  const onSwitchClick = () => requestToggle(!value);

  const onSwitchKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      requestToggle(!value);
    }
  };

  const confirmDisable = () => {
    applyToggle(false);
    setShowDisable(false);
  };

  const cancelDisable = () => {
    setShowDisable(false);
  };

  return (
    <>
      <div className="py-3 px-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col flex-[0.9] min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="text-[13px] font-semibold text-neutral-100 break-words">{row.title}</div>
              <button
                type="button"
                onClick={() => setShowInfo(!showInfo)}
                className="flex-shrink-0 text-neutral-400 hover:text-neutral-200 transition-colors"
                aria-label={t('popup.features.info_button_aria', { feature: row.title })}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 7.5V11.5M8 5.5V5.51" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
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
            className="relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex-shrink-0"
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
      </div>

      {showInfo && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowInfo(false)}
          style={{ margin: 0 }}
        >
          <div
            className="bg-[#0E0E0E] rounded-xl p-4 max-w-sm w-full border border-[#2A2A2A] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-semibold text-neutral-100">{row.title}</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="text-neutral-400 hover:text-neutral-200 transition-colors"
                aria-label={t('common.close')}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <p className="text-[12px] leading-relaxed text-neutral-300 whitespace-pre-line">{row.infoText}</p>
          </div>
        </div>
      )}

      <DisableCoverageModal open={showDisable} onCancel={cancelDisable} onConfirm={confirmDisable} />
    </>
  );
}
