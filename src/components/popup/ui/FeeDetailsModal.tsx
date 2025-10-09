import React from 'react';
import Modal from './Modal';

const YELLOW = '#F6B74A';
const GREEN = '#22C55E';

export default function FeeDetailsModal({
  open,
  onClose,
  onGotIt,
  onFileClaim,
}: {
  open: boolean;
  onClose: () => void;
  onGotIt: () => void;
  onFileClaim?: () => void;
}) {
  const items = [
    'Malicious transactions that slip through',
    'Address poisoning attacks',
    'Wallet drains on supported chains',
    'Up to $30,000 reimbursement per incident',
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <div className="px-4 pt-5 pb-4">
        <div className="text-[22px] font-extrabold leading-tight text-neutral-100">$30,000 Theft Protection</div>
        <div className="mt-1 text-[12px] text-neutral-400">
          Comprehensive wallet drain coverage for just ~0.8% per transaction
        </div>
      </div>

      <div className="px-4">
        <div className="rounded-[14px] bg-[#0F0F0F] border border-[#2A2A2A] px-4 py-4">
          <div className="text-[13px] font-semibold text-neutral-100 mb-3">What’s covered:</div>

          <ul className="space-y-2">
            {items.map((txt) => (
              <li key={txt} className="flex items-start gap-2">
                <span
                  className="mt-[2px] inline-flex h-4 w-4 items-center justify-center rounded-full"
                  style={{ color: GREEN }}
                  aria-hidden
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12.5l4 4 10-10"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-[12px] text-neutral-300 leading-snug">{txt}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <button
              onClick={onFileClaim}
              className="w-full h-9 rounded-[10px] text-[12px] font-semibold border border-[#3A3A3A] text-neutral-200 hover:bg-[#151515] transition-colors"
            >
              File a claim
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 text-center">
        <div className="text-[11px] text-neutral-500">Turn coverage ON/OFF anytime — fees only apply when active</div>
      </div>

      <div className="px-4 pb-4 pt-3">
        <button
          onClick={onGotIt}
          className="w-full h-10 rounded-[12px] text-[13px] font-semibold text-black hover:opacity-95 active:opacity-90 transition-opacity"
          style={{ backgroundColor: YELLOW }}
        >
          Got it
        </button>

        <button
          onClick={onClose}
          className="mt-2 w-full h-8 rounded-[10px] text-[12px] font-medium text-neutral-300 hover:text-neutral-200"
          aria-label="Close"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
