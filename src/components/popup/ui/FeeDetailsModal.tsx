import React from 'react';
import Modal from './Modal';
import { useTranslations } from '../../../i18n';

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
  const t = useTranslations();
  const covered = [
    {
      title: t('popup.fee_modal.covered.malicious.title'),
      desc: t('popup.fee_modal.covered.malicious.description'),
    },
    {
      title: t('popup.fee_modal.covered.address_poisoning.title'),
      desc: t('popup.fee_modal.covered.address_poisoning.description'),
    },
    {
      title: t('popup.fee_modal.covered.permit.title'),
      desc: t('popup.fee_modal.covered.permit.description'),
    },
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[340px] max-w-full bg-[#0B0B0B] rounded-[16px] border border-[#222] overflow-hidden">
        <div className="px-4 pt-4">
          <div className="text-[19px] font-extrabold leading-tight text-neutral-100">{t('popup.fee_modal.title')}</div>
          <div className="mt-[2px] text-[11px] leading-[1.2] text-neutral-400">{t('popup.fee_modal.subtitle')}</div>
        </div>

        <div className="px-4 mt-5">
          <div className="flex items-baseline gap-2">
            <div className="text-[22px] font-extrabold text-[#54b05e] leading-none">
              {t('popup.fee_modal.protection_amount')}
            </div>
            <span className="text-[10px] font-semibold tracking-wide text-neutral-400">
              {t('popup.fee_modal.protection_label')}
            </span>
          </div>
          <div className="mt-[3px] text-[10px] text-neutral-400 leading-none">
            {t('popup.fee_modal.protection_caption')}
          </div>
        </div>

        <div className="px-4 mt-4">
          <div className="rounded-[12px] bg-[#0F0F0F] border border-[#222] px-3 py-3">
            <div className="text-[10px] font-semibold tracking-[0.08em] uppercase text-neutral-400 mb-2">
              {t('popup.fee_modal.covered_heading')}
            </div>

            <div className="space-y-2">
              {covered.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-2 rounded-[10px] bg-[#111] border border-[#222] px-1 py-[10px]"
                >
                  <span
                    className="mt-[2px] inline-flex h-[18px] w-[18px] items-center justify-center rounded-full"
                    style={{ backgroundColor: GREEN }}
                    aria-hidden
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12.5l4 4 10-10"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>

                  <div className="flex-1">
                    <div className="text-[12px] font-semibold text-neutral-100 leading-[1.1]">{item.title}</div>
                    <div className="text-[11px] text-neutral-400 leading-snug">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 text-center text-[10px] text-neutral-500">t('popup.fee_modal.fee_note')</div>
          </div>
        </div>

        <div className="px-4 pt-3">
          <button
            onClick={onGotIt}
            className="w-full h-9 rounded-[12px] text-[13px] font-semibold text-black hover:opacity-95 active:opacity-90 transition-opacity"
            style={{ backgroundColor: YELLOW }}
          >
            {t('popup.fee_modal.got_it')}
          </button>
        </div>

        <div className="px-4 pt-2 text-center">
          <div className="text-[11px] text-neutral-500">
            {t('popup.fee_modal.claim_prompt')}{' '}
            <button onClick={onFileClaim} className="underline text-neutral-300 hover:text-[#22C55E] transition-colors">
              {t('popup.fee_modal.file_claim')}
            </button>
          </div>
        </div>

        <div className="px-4 pb-4 pt-2">
          <div className="text-[9px] leading-snug text-neutral-600 text-center">{t('popup.fee_modal.disclaimer')}</div>
        </div>
      </div>
    </Modal>
  );
}
