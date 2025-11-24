import React, { useState, useRef, useEffect } from 'react';
import { useLocale, localeOptions, getLocaleOption, useTranslations } from '../../../i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = getLocaleOption(locale);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (option: (typeof localeOptions)[0]) => {
    setLocale(option.value);
    setIsOpen(false);
  };

  return (
    <div className="py-3 px-3 relative" ref={dropdownRef}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-neutral-100 break-words">{t('popup.language.title')}</div>
          <div className="text-[12px] leading-snug break-words text-neutral-400">{currentOption.label}</div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] text-[12px] text-neutral-300 hover:text-neutral-100 hover:border-[#3A3A3A] transition-colors"
            aria-label={t('popup.language.title')}
            aria-expanded={isOpen}
          >
            <span>{currentOption.label}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            >
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute right-0 bottom-full mb-2 w-48 rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] shadow-lg z-50 overflow-hidden">
              {localeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-3 py-2 text-[12px] transition-colors ${
                    option.value === currentOption.value
                      ? 'bg-[#1A1A1A] text-neutral-100'
                      : 'text-neutral-300 hover:bg-[#1A1A1A] hover:text-neutral-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
