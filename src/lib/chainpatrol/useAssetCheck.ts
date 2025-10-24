import * as React from 'react';
import { ChainPatrolResponse, checkAsset } from './chainpatrol';

export function useAssetCheck(content?: string | null, apiKey?: string) {
  const [status, setStatus] = React.useState<string | 'LOADING'>('LOADING');
  const [last, setLast] = React.useState<ChainPatrolResponse | null>(null);

  React.useEffect(() => {
    const value = (content || '').trim();
    if (!value || !apiKey) {
      setStatus('UNKNOWN');
      setLast(null);
      return;
    }

    const c = new AbortController();
    setStatus('LOADING');

    const t = setTimeout(async () => {
      try {
        const res = await checkAsset(value, apiKey, c.signal);
        console.log('TESTING', res, value, apiKey, c.signal);

        setStatus(res.status ?? 'UNKNOWN');
        setLast(res);
      } catch {
        setStatus('UNKNOWN');
        setLast(null);
      }
    }, 150);

    return () => {
      c.abort();
      clearTimeout(t);
    };
  }, [content, apiKey]);

  return { status, details: last };
}
