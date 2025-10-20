import React, { useState } from 'react';
import useBrowserStorage from '../../../hooks/useBrowserStorage';
import { FEATURE_KEYS, FEATURE_DEFAULTS } from '../../../lib/constants';

const YELLOW = '#F6B74A';

interface AdToggleProps {
  title: string;
  storageKey: string;
  defaultValue: boolean;
  darkMode: boolean;
}

const AdToggle: React.FC<AdToggleProps> = ({ title, storageKey, defaultValue, darkMode }) => {
  const [value, setValue] = useBrowserStorage<boolean>('local', storageKey, defaultValue);

  if (value === undefined) return null;

  const onSwitchClick = () => setValue(!value);

  const onSwitchKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setValue(!value);
    }
  };

  return (
    <div className="flex items-center justify-between py-2 px-3">
      <div className="text-[12px] text-neutral-300">{title}</div>
      <button
        type="button"
        role="switch"
        aria-checked={!!value}
        aria-label={title}
        onClick={onSwitchClick}
        onKeyDown={onSwitchKeyDown}
        className="relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{
          width: 44,
          height: 24,
          background: value ? YELLOW : '#3F3F46',
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
  );
};

export default function AdWarningsExpandable({ darkMode }: { darkMode: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="py-3 px-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-neutral-100 break-words">Ad Warnings</div>
          <div className="text-[12px] leading-snug break-words text-neutral-400">
            Catch spoofed sites before you click
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-neutral-400 hover:text-neutral-200 transition-colors p-1"
          aria-label="Expand ad warnings options"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pl-3 space-y-1 border-l-2 border-[#2A2A2A]">
          <AdToggle
            title="Google Ads"
            storageKey={FEATURE_KEYS.GOOGLE_AD_WARN}
            defaultValue={FEATURE_DEFAULTS[FEATURE_KEYS.GOOGLE_AD_WARN]}
            darkMode={darkMode}
          />
          <AdToggle
            title="CoinGecko Ads"
            storageKey={FEATURE_KEYS.COINGECKO_AD_WARN}
            defaultValue={FEATURE_DEFAULTS[FEATURE_KEYS.COINGECKO_AD_WARN]}
            darkMode={darkMode}
          />
          <AdToggle
            title="DexTools Ads"
            storageKey={FEATURE_KEYS.DEXTOOLS_AD_WARN}
            defaultValue={FEATURE_DEFAULTS[FEATURE_KEYS.DEXTOOLS_AD_WARN]}
            darkMode={darkMode}
          />
          <AdToggle
            title="DexScreener Ads"
            storageKey={FEATURE_KEYS.DEXSCREENER_AD_WARN}
            defaultValue={FEATURE_DEFAULTS[FEATURE_KEYS.DEXSCREENER_AD_WARN]}
            darkMode={darkMode}
          />
        </div>
      )}
    </div>
  );
}
