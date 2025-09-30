import React, { useState } from 'react';

const YELLOW = '#F6B74A';

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative inline-flex items-center rounded-full transition-colors"
      style={{
        width: 44,
        height: 24,
        background: on ? YELLOW : '#3F3F46',
        boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.25)',
      }}
      aria-pressed={on}
    >
      <span
        className="absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full transition-transform shadow"
        style={{
          background: 'linear-gradient(180deg,#FFFFFF,#EDEDED)',
          transform: on ? 'translateX(20px)' : 'translateX(0px)',
        }}
      />
    </button>
  );
}

function GhostButton({ children, disabled = true }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      className="h-8 px-3 rounded-[10px] text-[12px] font-semibold"
      style={{
        color: disabled ? '#9CA3AF' : '#E5E7EB',
        background: '#111111',
        border: '1px solid #2A2A2A',
        opacity: disabled ? 0.9 : 1,
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}

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
