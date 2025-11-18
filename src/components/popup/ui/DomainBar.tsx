// DomainBar.tsx
import React from 'react';
import type { ChainPatrolStatus } from '../../../lib/chainpatrol/chainpatrol';
import { checkUrlFull } from '../../../lib/chainpatrol/chainpatrol';
import { CHAINPATROL_API_KEY } from '../../../lib/constants';

type DomainBarProps = {
  // When true, only show the badge if the url is malicious (BLOCKED).
  // Useful for restricting warnings to specific tabs.
  showWarningOnlyWhenMalicious?: boolean;
  // When true, hide the entire bar (including the URL) unless the site is malicious.
  onlyShowWhenMalicious?: boolean;
};

export default function DomainBar({
  showWarningOnlyWhenMalicious = false,
  onlyShowWhenMalicious = false,
}: DomainBarProps) {
  const [domain, setDomain] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<ChainPatrolStatus | 'LOADING'>('LOADING');

  const warnedForUrlRef = React.useRef<string | null>(null);

  // If the active tab is a warning interstitial (e.g. Fairside or MetaMask),
  // extract the originally visited URL so we can reflect its status in the popup.
  function extractOriginalFromMetaMaskWarning(u: string): string | null {
    try {
      const url = new URL(u);
      if (!/metamask\.github\.io$/.test(url.hostname)) return null;
      if (!/phishing-warning/.test(url.pathname)) return null;
      const hash = url.hash?.replace(/^#/, '') || '';
      const params = new URLSearchParams(hash);
      const hrefParam = params.get('href') || params.get('url') || params.get('link');
      return hrefParam ? decodeURIComponent(hrefParam) : null;
    } catch {
      return null;
    }
  }

  function extractOriginalFromFairsideWarning(u: string): string | null {
    try {
      const url = new URL(u);
      const isFairside = url.hostname.toLowerCase().endsWith('fairside.io');
      const isWarning = url.pathname.toLowerCase().includes('/warning');
      if (!isFairside || !isWarning) return null;
      const q = url.searchParams.get('url');
      return q || null;
    } catch {
      return null;
    }
  }

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const tabUrlRaw = tab?.url;
        if (!tabUrlRaw) {
          if (!cancelled) {
            setDomain(null);
            setStatus('UNKNOWN');
          }
          return;
        }

        // Determine the URL we should evaluate (may differ on warning pages)
        let effectiveUrl = tabUrlRaw;
        const fairsideOriginal = extractOriginalFromFairsideWarning(tabUrlRaw);
        const mmOriginal = extractOriginalFromMetaMaskWarning(tabUrlRaw);
        if (fairsideOriginal) effectiveUrl = fairsideOriginal;
        else if (mmOriginal) effectiveUrl = mmOriginal;

        let host = '';
        try {
          host = new URL(effectiveUrl).hostname;
        } catch {}
        if (!host) {
          if (!cancelled) {
            setDomain(null);
            setStatus('UNKNOWN');
          }
          return;
        }

        if (!cancelled) setDomain(host);

        const s = await checkUrlFull(effectiveUrl, CHAINPATROL_API_KEY ?? '');
        if (!cancelled) {
          setStatus(s);

          if (s === 'BLOCKED' && warnedForUrlRef.current !== effectiveUrl) {
            warnedForUrlRef.current = effectiveUrl;
            chrome.runtime.sendMessage({ type: 'CP_DOMAIN_BLOCKED', url: effectiveUrl, hostname: host });
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

  // If requested, hide the entire bar unless malicious
  if (onlyShowWhenMalicious && !isBlocked) {
    return null;
  }

  // Determine if the badge should be rendered at all
  const shouldShowBadge = showWarningOnlyWhenMalicious ? isBlocked : true;

  // Make the malicious badge more bold/prominent (same size)
  const badgeClasses = isLoading
    ? 'bg-[#1A1A1A] text-neutral-300'
    : isBlocked
      ? 'bg-[#220909] text-[#FF6B6B] border-[#7A1A1A] font-extrabold'
      : isUnknown
        ? 'bg-[#1A1A1A] text-neutral-300'
        : 'bg-[#0F2F22] text-[#6EE7B7]';

  const badgeText = isLoading ? 'Checking…' : isUnknown ? '● Unknown' : isBlocked ? '● Malicious' : '● Safe';

  return (
    <div className="mt-3">
      <div className="w-full rounded-[8px] bg-[#0F0F0F] px-3 h-[32px] flex items-center justify-between">
        <span className="text-[12px] text-neutral-200 truncate">{domain}</span>
        {shouldShowBadge ? (
          <span className={`text-[11px] px-[8px] py-[2px] rounded-full border ${badgeClasses}`}>{badgeText}</span>
        ) : null}
      </div>
      {/* {address && (
        <div className="mt-2 px-3">
          <div className="text-[11px] text-neutral-400">
            Connected:{' '}
            <span className="text-neutral-200">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
        </div>
      )} */}
    </div>
  );
}
