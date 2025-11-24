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
import zh from './locales/zh_CN/translation.json';

export const locales = ['en', 'es', 'ja', 'ru', 'zh'] as const;
export type Locale = (typeof locales)[number];
export const isLocale = (locale: string): locale is Locale => locales.includes(locale as Locale);

export const localeOptions: Array<Option<Locale>> = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'ru', label: 'Русский' },
  { value: 'ja', label: '日本語' },
  { value: 'es', label: 'Español' },
];

export const getLocaleOption = (locale?: Locale) =>
  localeOptions.find((option) => option.value === locale) ?? localeOptions[0];

const [browserConfigLocale] = Browser.i18n.getUILanguage().split('-');
const defaultLocale = isLocale(browserConfigLocale) ? browserConfigLocale : 'en';

const messagesMap = { en, es, ja, ru, zh } as const;

export const defaultTranslationValues: RichTranslationValues = {
  i: (children) => <span className="italic">{children}</span>,
  b: (children) => <span className="font-bold">{children}</span>,
  'discord-link': (children) => (
    <Href href={Urls.DISCORD} underline="always">
      {children}
    </Href>
  ),
  'kerberus-word': (children) => <span className="font-bold text-[#5470FF]">{children}</span>,
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
      // @ts-expect-error: locale file types are broader than AbstractIntlMessages, but compatible at runtime
      messages={messages}
      defaultTranslationValues={defaultTranslationValues}
    >
      {children}
    </BaseIntlProvider>
  );
};

export { useTranslations } from 'use-intl';
