import { Duplex } from 'readable-stream';
import Browser from 'webextension-polyfill';

// TODO: Timeout
export const sendAndAwaitResponseFromStream = (stream: Duplex, data: any): Promise<any> => {
  return new Promise((resolve) => {
    const id = Math.random();
    stream.write({ id, data }, console.log);

    const callback = (response: any) => {
      if (response.id === id) {
        resolve(response.data);
        stream.off('data', callback);
      }
    }

    stream.on('data', callback)
  })
}

// TODO: Timeout
export const sendAndAwaitResponseFromPort = (stream: Browser.Runtime.Port, data: any): Promise<any> => {
  return new Promise((resolve) => {
    const id = Math.random();
    stream.postMessage({ id, data });

    const callback = (response: any) => {
      if (response.id === id) {
        resolve(response.data);
        stream.onMessage.removeListener(callback);
      }
    }

    stream.onMessage.addListener(callback);
  })
}

