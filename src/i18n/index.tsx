import i18n from 'i18next';
import { useEffect } from 'react';
import { initReactI18next, useTranslation as useTranslationBase } from 'react-i18next';
import Browser from 'webextension-polyfill';
import useBrowserStorage from '../hooks/use-browser-storage';
import en from './locales/en/translation.json';
import es from './locales/es/translation.json';
import zh from './locales/zh/translation.json';

const [lng] = Browser.i18n.getUILanguage().split('-');

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    zh: { translation: zh },
  },
  lng,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// We have to wrap useTranslation() to allow us to update the i18n language after initialisation
// NOTE: Not sure why it has to be like this, but this was the easiest fix
export const useTranslation = () => {
  const translation = useTranslationBase();
  const [locale, setLocale] = useBrowserStorage('sync', 'settings:locale', lng);

  useEffect(() => {
    translation.i18n.changeLanguage(locale);
  }, [locale]);

  return { ...translation, locale, setLocale };
};

export { Trans } from 'react-i18next';
