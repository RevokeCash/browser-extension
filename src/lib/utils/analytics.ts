import * as amplitude from '@amplitude/analytics-browser';
import { getStorage, setStorage } from './storage';
import { randomId } from './misc';

let userId: string;

// This is technically async, but it's safe to assume that this will complete before any tracking occurs
export const initialiseAnalytics = async () => {
  const storedId = await getStorage<string>('sync', 'user:id');
  userId = storedId ?? randomId();
  if (!storedId) await setStorage('sync', 'user:id', userId);

  if (process.env.AMPLITUDE_API_KEY) {
    amplitude.init(process.env.AMPLITUDE_API_KEY!, userId, {
      trackingOptions: {
        ipAddress: false,
      },
    });
  }
};

initialiseAnalytics();

export const track = (event: string, properties: Record<string, any>) => {
  console.log('Tracking event', event, properties, process.env.AMPLITUDE_API_KEY);
  if (process.env.AMPLITUDE_API_KEY) amplitude.track(event, properties);
};

export const setUserProperty = (property: string, value: any) => {
  const identify = new amplitude.Identify().set(property, value);
  if (process.env.AMPLITUDE_API_KEY) amplitude.identify(identify);
};
