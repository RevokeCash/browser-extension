import { WarningData } from '../types';

export const decodeWarningData = (params: URLSearchParams): WarningData | undefined => {
  try {
    return JSON.parse(params.get('warningData') || '');
  } catch {
    return undefined;
  }
};
