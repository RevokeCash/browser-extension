import Browser from 'webextension-polyfill';
import type { TenderlyConfig } from './types';
import { TENDERLY_ACCESS_KEY, TENDERLY_ACCOUNT, TENDERLY_PROJECT } from '../lib/constants';

const DEFAULTS: TenderlyConfig = {
  enabled: true,
  account: TENDERLY_ACCOUNT,
  project: TENDERLY_PROJECT,
  accessKey: TENDERLY_ACCESS_KEY,
  network: '',
};

export async function getTenderlyConfig(): Promise<TenderlyConfig> {
  try {
    const { tenderly } = await Browser.storage.sync.get('tenderly');
    return { ...DEFAULTS, ...(tenderly || {}) };
  } catch {
    return DEFAULTS;
  }
}
