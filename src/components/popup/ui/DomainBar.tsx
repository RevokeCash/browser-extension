import React from 'react';
import { VERIFIED_DOMAINS } from '../../../lib/constants';

export default function DomainBar({ domain }: { domain: string }) {
  const isVerified = VERIFIED_DOMAINS.includes(domain);

  const badgeColor = isVerified ? 'bg-[#0F2F22] text-[#6EE7B7]' : 'bg-[#2F0F0F] text-[#F87171]';
  const badgeText = isVerified ? '● Verified' : '● Unverified';

  return (
    <div className="mt-3">
      <div className="w-full rounded-[8px] bg-[#0F0F0F] px-3 h-[32px] flex items-center justify-between">
        <span className="text-[12px] text-neutral-200 truncate">{domain}</span>

        <span className={`text-[11px] px-[8px] py-[2px] rounded-full border border-[#1E1E1E] ${badgeColor}`}>
          {badgeText}
        </span>
      </div>
    </div>
  );
}
