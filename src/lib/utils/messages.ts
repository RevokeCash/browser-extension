import objectHash from 'object-hash';
import { Duplex } from 'readable-stream';
import Browser from 'webextension-polyfill';
import { BYPASS_TYPES } from '../constants';

// TODO: Timeout
export const sendAndAwaitResponseFromStream = (stream: Duplex, data: any): Promise<any> => {
  return new Promise((resolve) => {
    const id = objectHash(data.transaction ?? data.typedData ?? data.message ?? data);
    stream.write({ id, data });

    const callback = (response: any) => {
      if (response.id === id) {
        stream.off('data', callback);
        resolve(response.data);
      }
    };

    stream.on('data', callback);
  });
};

// TODO: Timeout
export const sendAndAwaitResponseFromPort = (stream: Browser.Runtime.Port, data: any): Promise<any> => {
  return new Promise((resolve) => {
    const id = objectHash(data.transaction ?? data.typedData ?? data.message ?? data);
    stream.postMessage({ id, data });

    const callback = (response: any) => {
      if (response.id === id) {
        stream.onMessage.removeListener(callback);
        resolve(response.data);
      }
    };

    stream.onMessage.addListener(callback);
  });
};

export const isBypassMessage = (message: any) => BYPASS_TYPES.includes(message?.data?.type);
