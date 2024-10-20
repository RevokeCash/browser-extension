import React from 'react';
import { IntlProvider as BaseIntlProvider, RichTranslationValues } from 'use-intl';
import Browser from 'webextension-polyfill';
import Href from '../components/common/Href';
import { Option } from '../components/popup/settings/SelectPage';
import useBrowserStorage from '../hooks/useBrowserStorage';
import { Urls } from '../lib/constants';
import en from './locales/en/translation.json';
import es from './locales/es/translation.json';
import ja from './locales/ja/translation.json';
import ru from './locales/ru/translation.json';
import zh_CN from './locales/zh_CN/translation.json';
import zh_TW from './locales/zh_TW/translation.json';

export const locales = ['en', 'es', 'ja', 'ru', 'zh_CN', 'zh_TW'] as const;
export type Locale = (typeof locales)[number];

export const isLocale = (locale: string): locale is Locale =>
  locales.includes(locale as Locale) ||
  (locale.startsWith('zh-') && (locales.includes('zh_CN' as Locale) || locales.includes('zh_TW' as Locale)));

export const localeOptions: Array<Option<Locale>> = [
  { value: 'en', label: 'English' },
  { value: 'zh_CN', label: '简体中文' },
  { value: 'zh_TW', label: '正體中文' },
  { value: 'ru', label: 'Русский' },
  { value: 'ja', label: '日本語' },
  { value: 'es', label: 'Español' },
];

export const getLocaleOption = (locale?: Locale) =>
  localeOptions.find((option) => option.value === locale) ?? localeOptions[0];

const getDefaultLocale = (): Locale => {
  const browserLocale = Browser.i18n.getUILanguage();
  if (browserLocale.startsWith('zh-')) {
    // For Chinese, we need to differentiate between Simplified and Traditional
    return browserLocale.toLowerCase().includes('tw') || browserLocale.toLowerCase().includes('hk') ? 'zh_TW' : 'zh_CN';
  }
  return isLocale(browserLocale) ? (browserLocale as Locale) : 'en';
};

const defaultLocale = getDefaultLocale();

const messagesMap = { en, es, ja, ru, zh_CN, zh_TW } as const;

export const defaultTranslationValues: RichTranslationValues = {
  i: (children) => <span className="italic">{children}</span>,
  b: (children) => <span className="font-bold">{children}</span>,
  'discord-link': (children) => (
    <Href href={Urls.DISCORD} underline="always">
      {children}
    </Href>
  ),
};

export const useLocale = () => {
  const [locale, setLocale] = useBrowserStorage('sync', 'settings:locale', defaultLocale);
  return { locale, setLocale };
};

interface Props {
  children: React.ReactNode;
}

export const IntlProvider = ({ children }: Props) => {
  const [locale] = useBrowserStorage('sync', 'settings:locale', defaultLocale);
  const messages = messagesMap[locale ?? defaultLocale];

  return (
    <BaseIntlProvider
      locale={locale ?? defaultLocale}
      messages={messages}
      defaultTranslationValues={defaultTranslationValues}
    >
      {children}
    </BaseIntlProvider>
  );
};

export { useTranslations } from 'use-intl';
