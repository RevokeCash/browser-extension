import Browser from 'webextension-polyfill';

export const getStorage = async <T>(area: 'local' | 'sync', key: string, defaultValue?: T): Promise<T | undefined> => {
  const res = await Browser.storage[area].get(key);
  return (res[key] as T | undefined) ?? defaultValue;
};

export const setStorage = async <T>(area: 'local' | 'sync', key: string, value: T): Promise<void> => {
  await Browser.storage[area].set({ [key]: value });
};
