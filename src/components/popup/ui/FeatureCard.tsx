import React, { useState } from 'react';

const YELLOW = '#F6B74A';

type Row = { id: string; title: string; desc: string };
const rows: Row[] = [
  { id: 'sim', title: 'Transaction Simulator', desc: 'Preview before signing' },
  { id: 'ads', title: 'Google Ad/Result Warnings', desc: 'Catch spoofed sites before you click' },
  { id: 'addr', title: 'Address Guard', desc: 'Anti-poisoning on explorers' },
  { id: 'cov', title: 'Coverage', desc: 'Per-transaction coverage up to $30k' },
];

export default function FeatureCard({ onFeeDetails }: { onFeeDetails?: () => void }) {
  const [on, setOn] = useState<Record<string, boolean>>({
    sim: true,
    ads: true,
    addr: true,
    cov: true,
  });

  return (
    <div className="mt-3 rounded-[12px] border border-[#2A2A2A] bg-[#111111] overflow-hidden">
      <div className="px-3 pt-3 pb-2">
        <div className="text-[11px] font-semibold tracking-wide uppercase text-neutral-400">Active Protection</div>
      </div>

      <div className="px-3 pb-2">
        {rows.map((r, i) => (
          <div key={r.id} className="py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-neutral-100">{r.title}</div>
                <div className="text-[12px] text-neutral-400">{r.desc}</div>
              </div>

              <button
                onClick={() => setOn((s) => ({ ...s, [r.id]: !s[r.id] }))}
                className="relative inline-flex items-center rounded-full transition-colors"
                style={{ width: 44, height: 24, background: on[r.id] ? YELLOW : '#3F3F46' }}
                aria-pressed={on[r.id]}
              >
                <span
                  className="absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full transition-transform shadow"
                  style={{
                    background: '#FFFFFF',
                    transform: on[r.id] ? 'translateX(20px)' : 'translateX(0px)',
                  }}
                />
              </button>
            </div>

            {i < rows.length - 1 && <div className="mt-3 h-px bg-[#232323]" />}
          </div>
        ))}

        <div className="mt-2 mb-3 text-[12px] text-neutral-500">
          Coverage adds 0.8% per transaction.{' '}
          <button onClick={onFeeDetails} className="underline text-neutral-300">
            Fee details
          </button>
        </div>
      </div>
    </div>
  );
}
