import React, { useEffect, useMemo, useState } from 'react';

const YELLOW = '#F6B74A';
const STORAGE_KEY = 'updateBanner.dismissedMap';

function readDismissedMap(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function writeDismissedMap(map: Record<string, number>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota errors */
  }
}

type Props = {
  versionId: string;
  maxAgeDays?: number;
  onOpenWhatsNew?: () => void;
  className?: string;
};

export default function UpdateBanner({ versionId, maxAgeDays, onOpenWhatsNew, className }: Props) {
  const [visible, setVisible] = useState(false);

  const isDismissed = useMemo(() => {
    const map = readDismissedMap();
    const ts = map[versionId];
    if (!ts) return false;
    if (!maxAgeDays) return true;
    const ageMs = Date.now() - ts;
    return ageMs < maxAgeDays * 24 * 60 * 60 * 1000;
  }, [versionId, maxAgeDays]);

  useEffect(() => {
    setVisible(!isDismissed);
  }, [isDismissed]);

  const close = () => {
    const map = readDismissedMap();
    map[versionId] = Date.now();
    writeDismissedMap(map);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={['px-3 mt-2', className || ''].join(' ')} data-version={versionId}>
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] bg-[#0E0E0E] border border-[#1E1E1E]">
        {/* Alert Badge */}
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#F6B74A] animate-pulse" />
          <span className="text-[11px] font-semibold text-[#F6B74A] uppercase tracking-wider">New Update</span>
        </div>

        {/* Action Button */}
        <button
          onClick={onOpenWhatsNew}
          className="text-[11px] font-semibold px-3 py-1.5 rounded-[8px] text-black hover:opacity-90 transition-opacity"
          style={{ backgroundColor: YELLOW }}
        >
          What&apos;s New
        </button>

        <div className="flex-1" />

        {/* Close Button */}
        <button
          onClick={close}
          className="text-neutral-400 hover:text-neutral-200 text-lg leading-none font-semibold flex items-center justify-center h-6 w-6 transition-colors"
          aria-label="Close update banner"
        >
          ×
        </button>
      </div>
    </div>
  );
}
