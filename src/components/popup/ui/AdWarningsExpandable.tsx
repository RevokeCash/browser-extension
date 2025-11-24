import React, { useState } from 'react';
import useBrowserStorage from '../../../hooks/useBrowserStorage';
import { FEATURE_KEYS, FEATURE_DEFAULTS } from '../../../lib/constants';
import { useTranslations } from '../../../i18n';

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
  const [showInfo, setShowInfo] = useState(false);
  const t = useTranslations();

  // Child toggles' values
  const [google, setGoogle] = useBrowserStorage<boolean>(
    'local',
    FEATURE_KEYS.GOOGLE_AD_WARN,
    FEATURE_DEFAULTS[FEATURE_KEYS.GOOGLE_AD_WARN],
  );
  const [coingecko, setCoingecko] = useBrowserStorage<boolean>(
    'local',
    FEATURE_KEYS.COINGECKO_AD_WARN,
    FEATURE_DEFAULTS[FEATURE_KEYS.COINGECKO_AD_WARN],
  );
  const [dextools, setDextools] = useBrowserStorage<boolean>(
    'local',
    FEATURE_KEYS.DEXTOOLS_AD_WARN,
    FEATURE_DEFAULTS[FEATURE_KEYS.DEXTOOLS_AD_WARN],
  );
  const [dexscreener, setDexscreener] = useBrowserStorage<boolean>(
    'local',
    FEATURE_KEYS.DEXSCREENER_AD_WARN,
    FEATURE_DEFAULTS[FEATURE_KEYS.DEXSCREENER_AD_WARN],
  );

  if (google === undefined || coingecko === undefined || dextools === undefined || dexscreener === undefined)
    return null;

  const enabled = !!(google || coingecko || dextools || dexscreener);

  const setAll = (next: boolean) => {
    setGoogle(next);
    setCoingecko(next);
    setDextools(next);
    setDexscreener(next);
  };

  const onSwitchClick = () => setAll(!enabled);

  const onSwitchKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setAll(!enabled);
    }
  };

  return (
    <>
      <div className="py-3 px-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="text-[13px] font-semibold text-neutral-100 break-words">
                {t('popup.ad_warnings.title')}
              </div>
              <button
                type="button"
                onClick={() => setShowInfo(!showInfo)}
                className="flex-shrink-0 text-neutral-400 hover:text-neutral-200 transition-colors"
                aria-label={t('popup.ad_warnings.info_button_aria')}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 7.5V11.5M8 5.5V5.51" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="text-[12px] leading-snug break-words text-neutral-400">
              {t('popup.ad_warnings.subtitle')}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-neutral-400 hover:text-neutral-200 transition-colors p-1 flex-shrink-0"
              aria-label={t('popup.ad_warnings.expand_options_aria')}
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

            <button
              type="button"
              role="switch"
              aria-checked={!!enabled}
              aria-label={t('popup.ad_warnings.switch_aria')}
              onClick={onSwitchClick}
              onKeyDown={onSwitchKeyDown}
              className="relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex-shrink-0"
              style={{
                width: 44,
                height: 24,
                background: enabled ? YELLOW : '#3F3F46',
                boxShadow: darkMode ? 'none' : undefined,
              }}
            >
              <span
                className="absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full transition-transform shadow"
                style={{
                  background: '#FFFFFF',
                  transform: enabled ? 'translateX(20px)' : 'translateX(0px)',
                }}
              />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pl-3 space-y-1 border-l-2 border-[#2A2A2A]">
            <AdToggle
              title={t('popup.ad_warnings.toggles.google')}
              storageKey={FEATURE_KEYS.GOOGLE_AD_WARN}
              defaultValue={FEATURE_DEFAULTS[FEATURE_KEYS.GOOGLE_AD_WARN]}
              darkMode={darkMode}
            />
            <AdToggle
              title={t('popup.ad_warnings.toggles.coingecko')}
              storageKey={FEATURE_KEYS.COINGECKO_AD_WARN}
              defaultValue={FEATURE_DEFAULTS[FEATURE_KEYS.COINGECKO_AD_WARN]}
              darkMode={darkMode}
            />
            <AdToggle
              title={t('popup.ad_warnings.toggles.dextools')}
              storageKey={FEATURE_KEYS.DEXTOOLS_AD_WARN}
              defaultValue={FEATURE_DEFAULTS[FEATURE_KEYS.DEXTOOLS_AD_WARN]}
              darkMode={darkMode}
            />
            <AdToggle
              title={t('popup.ad_warnings.toggles.dexscreener')}
              storageKey={FEATURE_KEYS.DEXSCREENER_AD_WARN}
              defaultValue={FEATURE_DEFAULTS[FEATURE_KEYS.DEXSCREENER_AD_WARN]}
              darkMode={darkMode}
            />
          </div>
        )}
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
              <h3 className="text-[14px] font-semibold text-neutral-100">{t('popup.ad_warnings.title')}</h3>
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
            <p className="text-[12px] leading-relaxed text-neutral-300 whitespace-pre-line">
              {t('popup.ad_warnings.info_text')}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
