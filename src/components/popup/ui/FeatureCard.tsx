import React from 'react';
import { useColorTheme } from '../../../hooks/useColorTheme';
import { FEATURE_KEYS, FEATURE_DEFAULTS } from '../../../lib/constants';
import FeatureRowItem from './FeatureRow';

export type Row = {
  id: keyof typeof FEATURE_KEYS;
  title: string;
  desc: string;
  storageKey: string;
  defaultValue: boolean;
};

const rows: Row[] = [
  {
    id: 'SIMULATOR',
    title: 'Transaction Simulator',
    desc: 'Preview before signing',
    storageKey: FEATURE_KEYS.SIMULATOR,
    defaultValue: FEATURE_DEFAULTS[FEATURE_KEYS.SIMULATOR],
  },
  {
    id: 'GOOGLE_AD_WARN',
    title: 'Ad Warnings',
    desc: 'Catch spoofed sites before you click',
    storageKey: FEATURE_KEYS.GOOGLE_AD_WARN,
    defaultValue: FEATURE_DEFAULTS[FEATURE_KEYS.GOOGLE_AD_WARN],
  },
  {
    id: 'ADDRESS_GUARD',
    title: 'Address Guard',
    desc: 'Flags suspicious addresses on explorers',
    storageKey: FEATURE_KEYS.ADDRESS_GUARD,
    defaultValue: FEATURE_DEFAULTS[FEATURE_KEYS.ADDRESS_GUARD],
  },
  {
    id: 'COVERAGE',
    title: 'Wallet Drain Coverage',
    desc: 'Per-transaction coverage up to $30k',
    storageKey: FEATURE_KEYS.COVERAGE,
    defaultValue: FEATURE_DEFAULTS[FEATURE_KEYS.COVERAGE],
  },
];

export default function FeatureCard({ onFeeDetails }: { onFeeDetails?: () => void }) {
  const { darkMode } = useColorTheme();

  return (
    <div className="mt-3 rounded-[12px] border border-[#2A2A2A] bg-[#111111] overflow-hidden">
      <div className="px-3 pt-3 pb-2">
        <div className="text-[11px] font-semibold pl-3 tracking-wide uppercase text-neutral-400">Active Protection</div>
      </div>

      <div className="px-3 pb-2">
        {rows.map((r, i) => (
          <FeatureRowItem key={r.id} row={r} darkMode={darkMode} isLast={i === rows.length - 1} />
        ))}
      </div>
    </div>
  );
}
