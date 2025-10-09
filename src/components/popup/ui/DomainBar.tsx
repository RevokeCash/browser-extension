// DomainBar.tsx
import React from 'react';
import type { ChainPatrolStatus } from '../../../lib/chainpatrol/chainpatrol';
import { checkUrlFull } from '../../../lib/chainpatrol/chainpatrol';
import { CHAINPATROL_API_KEY } from '../../../lib/constants';

export default function DomainBar() {
  const [domain, setDomain] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<ChainPatrolStatus | 'LOADING'>('LOADING');

  const warnedForUrlRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const tabUrl = tab?.url;
        if (!tabUrl) {
          if (!cancelled) {
            setDomain(null);
            setStatus('UNKNOWN');
          }
          return;
        }

        let host = '';
        try {
          host = new URL(tabUrl).hostname;
        } catch {}
        if (!host) {
          if (!cancelled) {
            setDomain(null);
            setStatus('UNKNOWN');
          }
          return;
        }

        if (!cancelled) setDomain(host);

        const s = await checkUrlFull(tabUrl, CHAINPATROL_API_KEY);
        if (!cancelled) {
          setStatus(s);

          if (s === 'BLOCKED' && warnedForUrlRef.current !== tabUrl) {
            warnedForUrlRef.current = tabUrl;
            chrome.runtime.sendMessage({ type: 'CP_DOMAIN_BLOCKED', url: tabUrl, hostname: host });
          }
        }
      } catch {
        if (!cancelled) {
          setDomain(null);
          setStatus('UNKNOWN');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (domain === null) return null;

  const isBlocked = status === 'BLOCKED';
  const isLoading = status === 'LOADING';
  const isUnknown = status === 'UNKNOWN';

  const badgeClasses = isLoading
    ? 'bg-[#1A1A1A] text-neutral-300'
    : isBlocked
      ? 'bg-[#2F0F0F] text-[#F87171]'
      : isUnknown
        ? 'bg-[#1A1A1A] text-neutral-300'
        : 'bg-[#0F2F22] text-[#6EE7B7]';

  const badgeText = isLoading ? 'Checking…' : isUnknown ? '● Unknown' : isBlocked ? '● Malicious' : '● Safe';

  return (
    <div className="mt-3">
      <div className="w-full rounded-[8px] bg-[#0F0F0F] px-3 h-[32px] flex items-center justify-between">
        <span className="text-[12px] text-neutral-200 truncate">{domain}</span>
        <span className={`text-[11px] px-[8px] py-[2px] rounded-full border border-[#1E1E1E] ${badgeClasses}`}>
          {badgeText}
        </span>
      </div>
    </div>
  );
}
