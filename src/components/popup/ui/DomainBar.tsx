import React from 'react';

export default function DomainBar({
  domain,
  verified,
  address,
}: {
  domain: string;
  verified?: boolean;
  address?: string | null;
}) {
  return (
    <div className="mt-3">
      <div className="w-full rounded-[8px] bg-[#0F0F0F] px-3 h-[32px] flex items-center justify-between">
        <span className="text-[12px] text-neutral-200 truncate">{domain}</span>
        {verified && (
          <span className="text-[11px] px-[8px] py-[2px] rounded-full bg-[#0F2F22] text-[#6EE7B7]">● Verified</span>
        )}
      </div>
      {address && (
        <div className="mt-2 px-3">
          <div className="text-[11px] text-neutral-400">
            Connected:{' '}
            <span className="text-neutral-200">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
