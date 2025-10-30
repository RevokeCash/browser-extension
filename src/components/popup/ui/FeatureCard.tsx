import React from 'react';
import { useColorTheme } from '../../../hooks/useColorTheme';
import { FEATURE_KEYS, FEATURE_DEFAULTS } from '../../../lib/constants';
import FeatureRowItem from './FeatureRow';
import AdWarningsExpandable from './AdWarningsExpandable';
import SimulatorExpandable from './SimulatorExpandable';

export type Row = {
  id: keyof typeof FEATURE_KEYS;
  title: string;
  desc: string;
  infoText: string;
  storageKey: string;
  defaultValue: boolean;
};

const rows: Row[] = [
  {
    id: 'ADDRESS_GUARD',
    title: 'Address Poisoning Detection',
    desc: 'Flags suspicious addresses on explorers',
    infoText:
      "Address poisoning is a scam where attackers send small amounts from addresses that look similar to ones you interact with. This feature flags suspicious addresses on blockchain explorers like Etherscan, helping you avoid accidentally copying a scammer's address.",
    storageKey: FEATURE_KEYS.ADDRESS_GUARD,
    defaultValue: FEATURE_DEFAULTS[FEATURE_KEYS.ADDRESS_GUARD],
  },
  {
    id: 'X_OP_DETECTOR',
    title: 'X OP/NOP Detector',
    desc: 'Identifies original poster and malicious copycat accounts',
    infoText:
      'Scammers often copy legitimate crypto projects on X (Twitter) by using similar names and profile pictures. This detector identifies the original poster (OP) of a tweet and flags potential impersonator accounts (NOP - Not Original Poster) to protect you from phishing links.',
    storageKey: FEATURE_KEYS.X_OP_DETECTOR,
    defaultValue: FEATURE_DEFAULTS[FEATURE_KEYS.X_OP_DETECTOR],
  },
  {
    id: 'ETHOS_SCORE',
    title: 'Ethos Credibility Scores',
    desc: 'Shows credibility scores on X profiles',
    infoText:
      'Ethos provides credibility scores for X (Twitter) profiles based on their on-chain and social activity. These scores help you quickly assess the trustworthiness of accounts before interacting with their content or clicking their links.',
    storageKey: FEATURE_KEYS.ETHOS_SCORE,
    defaultValue: FEATURE_DEFAULTS[FEATURE_KEYS.ETHOS_SCORE],
  },
  {
    id: 'COVERAGE',
    title: 'Wallet Drain Coverage',
    desc: 'Drain coverage up to $30k',
    infoText:
      'If your wallet is drained despite using our protection, you may be eligible for coverage up to $30,000. This insurance-style protection gives you peace of mind when interacting with DeFi protocols and signing transactions.',
    storageKey: FEATURE_KEYS.COVERAGE,
    defaultValue: FEATURE_DEFAULTS[FEATURE_KEYS.COVERAGE],
  },
  {
    id: 'SLOWMODE',
    title: 'Slow Mode',
    desc: 'Adds intentional delay before confirming transactions',
    infoText:
      'Slow Mode adds a mandatory waiting period before you can confirm transactions. This built-in delay forces you to slow down and review transaction details carefully, helping prevent rushed decisions that could lead to losses.',
    storageKey: FEATURE_KEYS.SLOWMODE,
    defaultValue: FEATURE_DEFAULTS[FEATURE_KEYS.SLOWMODE],
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
        <SimulatorExpandable darkMode={darkMode} />

        <AdWarningsExpandable darkMode={darkMode} />

        <FeatureRowItem key="ADDRESS_GUARD" row={rows[0]} darkMode={darkMode} isLast={false} />

        <FeatureRowItem key="X_OP_DETECTOR" row={rows[1]} darkMode={darkMode} isLast={false} />

        <FeatureRowItem key="COVERAGE" row={rows[3]} darkMode={darkMode} isLast={true} />
      </div>

      <div className="px-3 pb-2 pt-6">
        <div className="text-[11px] font-semibold tracking-wide uppercase text-neutral-400">Experimental Features</div>
      </div>

      <div>
        <FeatureRowItem key="ETHOS_SCORE" row={rows[2]} darkMode={darkMode} isLast={false} />

        <FeatureRowItem key="SLOWMODE" row={rows[4]} darkMode={darkMode} isLast={true} />
      </div>
    </div>
  );
}
