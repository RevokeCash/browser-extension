import React from 'react';
import { useColorTheme } from '../../../hooks/useColorTheme';
import { FEATURE_KEYS, FEATURE_DEFAULTS } from '../../../lib/constants';
import FeatureRowItem from './FeatureRow';
import AdWarningsExpandable from './AdWarningsExpandable';

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
    id: 'ADDRESS_GUARD',
    title: 'Address Poisoning Detection',
    desc: 'Flags suspicious addresses on explorers',
    storageKey: FEATURE_KEYS.ADDRESS_GUARD,
    defaultValue: FEATURE_DEFAULTS[FEATURE_KEYS.ADDRESS_GUARD],
  },
  {
    id: 'X_OP_DETECTOR',
    title: 'X OP/NOP Detector',
    desc: 'Identifies original poster and malicious copycat accounts',
    storageKey: FEATURE_KEYS.X_OP_DETECTOR,
    defaultValue: FEATURE_DEFAULTS[FEATURE_KEYS.X_OP_DETECTOR],
  },
  {
    id: 'ETHOS_SCORE',
    title: 'Ethos Credibility Scores',
    desc: 'Shows credibility scores on X profiles',
    storageKey: FEATURE_KEYS.ETHOS_SCORE,
    defaultValue: FEATURE_DEFAULTS[FEATURE_KEYS.ETHOS_SCORE],
  },
  {
    id: 'COVERAGE',
    title: 'Wallet Drain Coverage',
    desc: 'Drain coverage up to $30k',
    storageKey: FEATURE_KEYS.COVERAGE,
    defaultValue: FEATURE_DEFAULTS[FEATURE_KEYS.COVERAGE],
  },
];

export default function FeatureCard({ onFeeDetails }: { onFeeDetails?: () => void }) {
  const { darkMode } = useColorTheme();

  return (
    <div className="mt-3">
      <div className="px-3 pb-2">
        <div className="text-[11px] font-semibold tracking-wide uppercase text-neutral-400">Active Protection</div>
      </div>

      <div>
        <FeatureRowItem key="SIMULATOR" row={rows[0]} darkMode={darkMode} isLast={false} />

        <AdWarningsExpandable darkMode={darkMode} />

        <FeatureRowItem key="ADDRESS_GUARD" row={rows[1]} darkMode={darkMode} isLast={false} />

        <FeatureRowItem key="X_OP_DETECTOR" row={rows[2]} darkMode={darkMode} isLast={false} />

        <FeatureRowItem key="ETHOS_SCORE" row={rows[3]} darkMode={darkMode} isLast={false} />

        <FeatureRowItem key="COVERAGE" row={rows[4]} darkMode={darkMode} isLast={true} />
      </div>
    </div>
  );
}
