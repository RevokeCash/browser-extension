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

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div
        className="
          relative z-10
          w-[340px] max-w-[92vw]
          bg-[#111111] text-[#EDEDED]
          rounded-[12px] border border-[#2A2A2A]
          shadow-lg overflow-hidden
          flex flex-col
        "
      >
        <div className="contents">{children}</div>
      </div>
    </div>
  );
}
