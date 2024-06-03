import React from 'react';
import { IntlProvider as BaseIntlProvider, RichTranslationValues } from 'use-intl';
import Browser from 'webextension-polyfill';
import Href from '../components/common/Href';
import useBrowserStorage from '../hooks/useBrowserStorage';
import { Urls } from '../lib/constants';
import en from './locales/en/translation.json';
import es from './locales/es/translation.json';
import ja from './locales/ja/translation.json';
import ru from './locales/ru/translation.json';
import zh from './locales/zh_CN/translation.json';

const messagesMap = { en, es, ja, ru, zh } as const;

const locales = ['en', 'es', 'ja', 'ru', 'zh'] as const;
type Locale = (typeof locales)[number];
const isLocale = (locale: string): locale is Locale => locales.includes(locale as Locale);

const [browserConfigLocale] = Browser.i18n.getUILanguage().split('-');
const defaultLocale = isLocale(browserConfigLocale) ? browserConfigLocale : 'en';

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
