import React, { useEffect } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div
        className="
          relative z-10
          w-[320px] max-h-[540px]
          bg-[#111111] text-[#EDEDED]
          rounded-[12px] border border-[#2A2A2A]
          shadow-lg overflow-hidden
        "
      >
        <div className="max-h-[480px] overflow-auto">{children}</div>
        <div className="h-[1px] bg-black/30" />
      </div>
    </div>
  );
}
