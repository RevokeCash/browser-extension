import React from 'react';
import { Urls } from '../../../lib/constants';

export default function Footer({
  activeTab,
  onCoverageClick,
}: {
  activeTab: 'features' | 'approvals' | 'settings';
  onCoverageClick?: () => void;
}) {
  const openReportBug = () => {
    const url = `https://forms.gle/tdjLjtdPdKVR37p38`;
    try {
      chrome.tabs?.create({ url, active: true });
      window.close();
    } catch (_) {
      // ignore
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 px-3 pb-3 bg-[#0B0B0B]">
      <div className="rounded-[12px] bg-[#0D0D0D] px-3 py-2 text-[12px] text-neutral-400 flex items-center justify-between gap-3">
        <div className="min-w-0 w-[60%]">
          {activeTab === 'features' ? (
            <>
              Wallet coverage provides multiple benefits.{` `}
              <button
                onClick={onCoverageClick}
                className="underline text-neutral-300 hover:text-neutral-100 transition-colors"
              >
                Benefits
              </button>
            </>
          ) : (
            <span>Found an issue?</span>
          )}
        </div>
        <button
          onClick={openReportBug}
          className="h-8 px-4 rounded-[10px] hover:bg-[#1E1E1E] text-[12px] font-semibold border border-[#1E1E1E] bg-[#0B0B0B] text-neutral-200 hover:text-neutral-100 transition-colors"
        >
          Report bug
        </button>
      </div>
    </div>
  );
}
