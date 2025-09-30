import React from 'react';
import Modal from './Modal';

const YELLOW = '#F6B74A';

export default function FeeDetailsModal({
  open,
  onClose,
  onGotIt,
}: {
  open: boolean;
  onClose: () => void;
  onGotIt: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="px-4 pt-4 pb-3 border-b border-[#1E1E1E]">
        <div className="text-[18px] font-extrabold leading-tight">Coverage is on by default</div>
        <div className="text-[12px] text-neutral-400">~0.8% per transaction when coverage is on</div>
      </div>
      <div className="px-4 py-3">
        <div className="rounded-[10px] bg-[#0F0F0F] border border-[#2A2A2A] px-4 py-3">
          <div className="text-[13px] font-semibold text-neutral-100 mb-2">Coverage Details</div>
          <ul className="text-[12px] text-neutral-300 list-disc pl-5 space-y-1.5">
            <li>Covers malicious transactions and address-poisoning losses on supported chains</li>
            <li>Claims handled by Fairside — file a claim from our Discord</li>
            <li>
              Up to <span className="font-bold">$30k</span> reimbursement per covered incident
            </li>
            <li>
              Fee applies only when <span className="font-bold">Coverage</span> is ON; no fee when OFF
            </li>
            <li>You can turn Coverage OFF anytime to avoid fees (coverage disabled while OFF)</li>
          </ul>
        </div>
      </div>
      <div className="px-4 py-3 bg-[#0E0E0E] border-t border-[#1E1E1E] flex items-center gap-2">
        <button
          onClick={onClose}
          className="h-8 px-3 rounded-[10px] text-[12px] font-semibold bg-[#111111] text-neutral-300 border border-[#2A2A2A]"
        >
          Close
        </button>
        <button
          onClick={onGotIt}
          className="h-8 px-3 rounded-[10px] text-[12px] font-semibold text-black"
          style={{ backgroundColor: YELLOW }}
        >
          Got it
        </button>
      </div>
    </Modal>
  );
}
