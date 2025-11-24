import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import { useTranslations } from '../../../i18n';

const YELLOW = '#F6B74A';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ClaimConsentModal({ open, onClose, onConfirm }: Props) {
  const t = useTranslations();
  const checkKeys = [
    'popup.claim_modal.checks.covered_events',
    'popup.claim_modal.checks.share_information',
    'popup.claim_modal.checks.kyc',
  ] as const;
  const [checked, setChecked] = useState<boolean[]>(() => checkKeys.map(() => false));

  useEffect(() => {
    if (!open) setChecked(checkKeys.map(() => false));
  }, [open]);

  const allChecked = checked.every(Boolean);

  const toggle = (i: number) => setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[360px] max-w-full bg-[#0B0B0B] rounded-[16px] border border-[#222] overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-4">
          <div className="text-[19px] font-extrabold leading-tight text-neutral-100">
            {t('popup.claim_modal.title')}
          </div>
          <div className="mt-[2px] text-[11px] leading-[1.2] text-neutral-400">{t('popup.claim_modal.subtitle')}</div>
        </div>

        {/* Body */}
        <div className="px-4 mt-4 space-y-2">
          {checkKeys.map((key, i) => (
            <label
              key={i}
              className="flex items-start gap-2 rounded-[12px] bg-[#101010] border border-[#1f1f1f] px-3 py-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => toggle(i)}
                className="mt-[2px] h-[14px] w-[14px] rounded-[3px] accent-[#22C55E] border border-[#333] bg-[#0f0f0f]"
              />
              <span className="text-[12px] text-neutral-200 leading-snug">{t(key)}</span>
            </label>
          ))}

          <div className="text-[10px] text-neutral-500 pt-1">{t('popup.claim_modal.disclaimer')}</div>
        </div>

        {/* Footer actions */}
        <div className="px-4 py-4 flex gap-2">
          <button
            onClick={onClose}
            className="h-9 flex-1 rounded-[12px] text-[13px] font-semibold text-neutral-200 border border-[#2a2a2a] bg-[#121212] hover:bg-[#151515] transition-colors"
          >
            {t('common.back')}
          </button>
          <button
            onClick={onConfirm}
            disabled={!allChecked}
            className="h-9 flex-1 rounded-[12px] text-[13px] font-semibold text-black disabled:opacity-50 hover:opacity-95 active:opacity-90 transition-opacity"
            style={{ backgroundColor: YELLOW }}
            aria-disabled={!allChecked}
            title={!allChecked ? t('popup.claim_modal.incomplete_hint') : t('popup.claim_modal.complete_hint')}
          >
            {t('popup.claim_modal.confirm')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
