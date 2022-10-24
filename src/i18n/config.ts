import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Browser from 'webextension-polyfill';

const [lng] = Browser.i18n.getUILanguage().split('-');

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: require('./locales/en/translation.json'),
    },
  },
  lng,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});
