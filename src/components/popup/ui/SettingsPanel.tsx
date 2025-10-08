import React, { useState } from 'react';
import { Toggle, GhostButton } from './controls';

export default function SettingsPanel() {
  const [microFees, setMicroFees] = useState(true);

  return (
    <div className="mt-3 rounded-[12px] border border-[#2A2A2A] bg-[#111111] overflow-hidden">
      <div className="px-3 pt-3 pb-2">
        <div className="text-[11px] font-semibold tracking-wide uppercase text-neutral-400">Quick Start</div>
      </div>

      <div className="px-3 pb-3">
        <div className="py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-neutral-100">Microtransaction Fees</div>
              <div className="text-[12px] text-neutral-400">Toggle coverage with 0.8% fee on/off</div>
            </div>
            <Toggle on={microFees} onChange={setMicroFees} />
          </div>
          <div className="mt-3 h-px bg-[#232323]" />
        </div>

        <div className="py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-neutral-100">Manage Wallets for Approvals</div>
              <div className="text-[12px] text-neutral-400">Add, label, or remove watched wallets</div>
            </div>
            <GhostButton>Open</GhostButton>
          </div>
        </div>
      </div>
    </div>
  );
}
