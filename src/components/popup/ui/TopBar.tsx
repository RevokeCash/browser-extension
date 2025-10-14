import React from 'react';
import useBrowserStorage from '../../../hooks/useBrowserStorage';
import { FEATURE_KEYS, FEATURE_DEFAULTS } from '../../../lib/constants';

const ICON_SRC = '/images/icon.png';

// colors
const GREEN = '#22C55E';
const GREEN_BG = 'rgba(34,197,94,0.12)';
const YELLOW = '#F6B74A';
const YELLOW_BG = 'rgba(246,183,74,0.12)';
const RED = '#ef4444';
const RED_BG = 'rgba(239,68,68,0.10)';

function StatusPill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      className="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border"
      style={{ color, borderColor: color, background: bg }}
      aria-live="polite"
    >
      {label}
    </span>
  );
}

export default function TopBar() {
  // read the 4 flags
  const [sim] = useBrowserStorage<boolean>('local', FEATURE_KEYS.SIMULATOR, FEATURE_DEFAULTS[FEATURE_KEYS.SIMULATOR]);
  const [ads] = useBrowserStorage<boolean>(
    'local',
    FEATURE_KEYS.GOOGLE_AD_WARN,
    FEATURE_DEFAULTS[FEATURE_KEYS.GOOGLE_AD_WARN],
  );
  const [addr] = useBrowserStorage<boolean>(
    'local',
    FEATURE_KEYS.ADDRESS_GUARD,
    FEATURE_DEFAULTS[FEATURE_KEYS.ADDRESS_GUARD],
  );
  const [cov] = useBrowserStorage<boolean>('local', FEATURE_KEYS.COVERAGE, FEATURE_DEFAULTS[FEATURE_KEYS.COVERAGE]);

  // while loading, keep layout identical with a subtle placeholder
  const loading = [sim, ads, addr, cov].some((v) => v === undefined);

  let label = 'ACTIVE';
  let color = GREEN;
  let bg = GREEN_BG;

  if (!loading) {
    const allOn = !!sim && !!ads && !!addr && !!cov;
    const coverageOff = cov === false;

    if (coverageOff) {
      label = 'AT RISK';
      color = RED;
      bg = RED_BG;
    } else if (!allOn) {
      label = 'CUSTOM';
      color = YELLOW;
      bg = YELLOW_BG;
    }
  }

  return (
    <div className="px-3 pt-3">
      <div className="w-full rounded-[10px] bg-[#0E0E0E] border border-[#1E1E1E] px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-7 w-7 rounded-md flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: 'rgba(246, 183, 74, 0.15)' }}
            >
              <img
                src={ICON_SRC}
                alt="Revoke icon"
                className="h-7 w-7"
                onError={(e) => {
                  (e.currentTarget as any).outerHTML =
                    '<span class="text-[12px] font-extrabold text-white leading-none">r</span>';
                }}
              />
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-[13px] font-semibold">revoke</span>
              <span className="text-[10px] text-neutral-400">by Revoke Cash and Fairside</span>
            </div>
          </div>

          <div className="flex items-center">
            {loading ? (
              <span className="h-6 w-16 rounded-full bg-[#1E1E1E]" />
            ) : (
              <StatusPill label={label} color={color} bg={bg} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
