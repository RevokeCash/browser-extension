import {useCallback, useEffect, useState} from 'react';
import Browser from 'webextension-polyfill';

// Updated from:
// https://github.com/onikienko/use-chrome-storage/blob/master/src/useChromeStorage.js

const useBrowserStorage = <T>(key: string, initialValue?: T): [T | undefined, (value: T) => void, boolean, string | undefined] => {
  const [state, setState] = useState();
  const [isPersistent, setIsPersistent] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const keyObj = initialValue === undefined ? key : {[key]: initialValue};
    Browser.storage.local.get(keyObj)
      .then(res => {
        setState(res[key]);
        setIsPersistent(true);
        setError(undefined);
      })
      .catch(error => {
        setIsPersistent(false);
        setError(error);
      });
  }, [key, initialValue]);

  const updateValue = useCallback((newValue) => {
    const toStore = typeof newValue === 'function' ? newValue(state) : newValue;

    Browser.storage.local.set({ [key]: toStore })
      .then(() => {
        setIsPersistent(true);
        setError(undefined);
      })
      .catch(error => {
        // set newValue to local state because chrome.storage.onChanged won't be fired in error case
        setState(toStore);
        setIsPersistent(false);
        setError(error);
      });
  }, [key, state]);

  useEffect(() => {
    const onChange = (changes: any, areaName: string) => {
      if (areaName === 'local' && key in changes) {
        setState(changes[key].newValue);
        setIsPersistent(true);
        setError(undefined);
      }
    };

    Browser.storage.onChanged.addListener(onChange);

    return () => {
      Browser.storage.onChanged.removeListener(onChange);
    };
  }, [key]);

  return [state, updateValue, isPersistent, error];
}

export default useBrowserStorage;
