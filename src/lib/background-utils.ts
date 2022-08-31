import Browser from 'webextension-polyfill';

export const getLocalStorage = async <T>(key: string, defaultValue?: T): Promise<T | undefined> => {
  const res = await Browser.storage.local.get({ [key]: defaultValue });
  return res[key];
}
