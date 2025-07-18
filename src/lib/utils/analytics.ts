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

// Mixpanel HTTP API implementation for browser extension background scripts
const trackMixpanel = async (event: string, properties: Record<string, any>) => {
  if (!process.env.MIXPANEL_API_KEY) return;

  try {
    const payload = {
      event,
      properties: {
        ...properties,
        distinct_id: userId,
        token: process.env.MIXPANEL_API_KEY,
        time: Math.floor(Date.now() / 1000),
      },
    };

    const encodedData = btoa(JSON.stringify(payload));

    const response = await fetch('https://api.mixpanel.com/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodedData}`,
    });

    if (!response.ok) {
      console.error('Mixpanel tracking failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Mixpanel error:', error);
  }
};

export const track = (event: string, properties: Record<string, any>) => {
  if (process.env.AMPLITUDE_API_KEY) amplitude.track(event, properties);
  if (process.env.MIXPANEL_API_KEY) trackMixpanel(event, properties);
};
