import React from 'react';
import Modal from './Modal';

const YELLOW = '#F6B74A';

export default function DisableCoverageModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel}>
      <div className="px-4 pt-5 pb-4">
        <div className="text-[22px] font-extrabold leading-tight text-neutral-100">Turn off coverage?</div>
        <div className="mt-2 text-[12px] text-neutral-400">
          You’ll turn <span className="font-semibold text-neutral-200">OFF</span> Coverage (0.8% fee stops applying).
          You’ll still keep other features you have toggled on.{' '}
          <span className="text-neutral-300">Not recommended.</span>
        </div>
      </div>

      <div className="px-4">
        <div className="rounded-[14px] bg-[#0F0F0F] border border-[#2A2A2A] px-4 py-4">
          <ul className="space-y-2">
            {['You can re-enable coverage anytime', 'No fee is charged when coverage is OFF'].map((txt) => (
              <li key={txt} className="flex items-start gap-2">
                <span className="mt-[6px] inline-block h-[6px] w-[6px] rounded-full bg-neutral-500" aria-hidden />
                <span className="text-[12px] text-neutral-300 leading-snug">{txt}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="px-4 pb-4 pt-4 flex items-center gap-2">
        <button
          onClick={onCancel}
          className="flex-1 h-10 rounded-[12px] text-[13px] font-semibold text-neutral-300 border border-[#2A2A2A] bg-transparent hover:bg-[#151515] transition-colors"
        >
          Keep protection
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 h-10 rounded-[12px] text-[13px] font-semibold text-black hover:opacity-95 active:opacity-90 transition-opacity"
          style={{ backgroundColor: YELLOW }}
          autoFocus
        >
          Lose Coverage
        </button>
      </div>
    </Modal>
  );
}
