import React, { useMemo } from 'react';
import { useColorTheme } from '../../../hooks/useColorTheme';
import { FEATURE_KEYS, FEATURE_DEFAULTS } from '../../../lib/constants';
import FeatureRowItem from './FeatureRow';
import AdWarningsExpandable from './AdWarningsExpandable';
import SimulatorExpandable from './SimulatorExpandable';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslations } from '../../../i18n';

export type Row = {
  id: keyof typeof FEATURE_KEYS;
  title: string;
  desc: string;
  infoText: string;
  storageKey: string;
  defaultValue: boolean;
};

type RowDefinition = {
  id: Row['id'];
  titleKey: string;
  descKey: string;
  infoKey: string;
  storageKey: string;
  defaultValue: boolean;
};

const rowDefinitions: RowDefinition[] = [
  {
    id: 'ANTIPHISH',
    titleKey: 'popup.features.rows.antiphish.title',
    descKey: 'popup.features.rows.antiphish.description',
    infoKey: 'popup.features.rows.antiphish.info',
    storageKey: FEATURE_KEYS.ANTIPHISH,
    defaultValue: FEATURE_DEFAULTS[FEATURE_KEYS.ANTIPHISH],
  },
  {
    id: 'ADDRESS_GUARD',
    titleKey: 'popup.features.rows.address_guard.title',
    descKey: 'popup.features.rows.address_guard.description',
    infoKey: 'popup.features.rows.address_guard.info',
    storageKey: FEATURE_KEYS.ADDRESS_GUARD,
    defaultValue: FEATURE_DEFAULTS[FEATURE_KEYS.ADDRESS_GUARD],
  },
  {
    id: 'X_OP_DETECTOR',
    titleKey: 'popup.features.rows.x_op_detector.title',
    descKey: 'popup.features.rows.x_op_detector.description',
    infoKey: 'popup.features.rows.x_op_detector.info',
    storageKey: FEATURE_KEYS.X_OP_DETECTOR,
    defaultValue: FEATURE_DEFAULTS[FEATURE_KEYS.X_OP_DETECTOR],
  },
  {
    id: 'ETHOS_SCORE',
    titleKey: 'popup.features.rows.ethos_score.title',
    descKey: 'popup.features.rows.ethos_score.description',
    infoKey: 'popup.features.rows.ethos_score.info',
    storageKey: FEATURE_KEYS.ETHOS_SCORE,
    defaultValue: FEATURE_DEFAULTS[FEATURE_KEYS.ETHOS_SCORE],
  },
  {
    id: 'COVERAGE',
    titleKey: 'popup.features.rows.coverage.title',
    descKey: 'popup.features.rows.coverage.description',
    infoKey: 'popup.features.rows.coverage.info',
    storageKey: FEATURE_KEYS.COVERAGE,
    defaultValue: FEATURE_DEFAULTS[FEATURE_KEYS.COVERAGE],
  },
  {
    id: 'SLOWMODE',
    titleKey: 'popup.features.rows.slowmode.title',
    descKey: 'popup.features.rows.slowmode.description',
    infoKey: 'popup.features.rows.slowmode.info',
    storageKey: FEATURE_KEYS.SLOWMODE,
    defaultValue: FEATURE_DEFAULTS[FEATURE_KEYS.SLOWMODE],
  },
];

export default function FeatureCard({ onFeeDetails }: { onFeeDetails?: () => void }) {
  const { darkMode } = useColorTheme();
  const t = useTranslations();

  const rows = useMemo<Row[]>(
    () =>
      rowDefinitions.map((row) => ({
        ...row,
        title: t(row.titleKey),
        desc: t(row.descKey),
        infoText: t(row.infoKey),
      })),
    [t],
  );

  return (
    <div className="mt-3">
      <div className="px-3 pb-2">
        <div className="text-[11px] font-semibold tracking-wide uppercase text-neutral-400">
          {t('popup.features.sections.active')}
        </div>
      </div>

      <div>
        <SimulatorExpandable darkMode={darkMode} />

        <AdWarningsExpandable darkMode={darkMode} />

        <FeatureRowItem key="ANTIPHISH" row={rows[0]} darkMode={darkMode} isLast={false} />
        <FeatureRowItem key="ADDRESS_GUARD" row={rows[1]} darkMode={darkMode} isLast={false} />
        <FeatureRowItem key="COVERAGE" row={rows[4]} darkMode={darkMode} isLast={true} />
      </div>

      <div className="px-3 pb-2 pt-6">
        <div className="text-[11px] font-semibold tracking-wide uppercase text-neutral-400">
          {t('popup.features.sections.experimental')}
        </div>
      </div>

      <div>
        <FeatureRowItem key="X_OP_DETECTOR" row={rows[2]} darkMode={darkMode} isLast={false} />

        <FeatureRowItem key="ETHOS_SCORE" row={rows[3]} darkMode={darkMode} isLast={false} />

        <FeatureRowItem key="SLOWMODE" row={rows[5]} darkMode={darkMode} isLast={false} />
      </div>

      <div className="px-3 pb-2 pt-6">
        <div className="text-[11px] font-semibold tracking-wide uppercase text-neutral-400">
          {t('popup.tabs.settings')}
        </div>
      </div>

      <div>
        <LanguageSwitcher />
      </div>
    </div>
  );
}
