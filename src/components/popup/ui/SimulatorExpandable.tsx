import React, { useState } from 'react';
import useBrowserStorage from '../../../hooks/useBrowserStorage';
import { FEATURE_KEYS, FEATURE_DEFAULTS } from '../../../lib/constants';

const YELLOW = '#F6B74A';

interface SimulatorModeOptionProps {
  id: string;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

const SimulatorModeOption: React.FC<SimulatorModeOptionProps> = ({ id, title, description, isSelected, onSelect }) => {
  return (
    <div
      className="flex items-start gap-3 py-3 px-3 cursor-pointer hover:bg-neutral-800/30 rounded-lg transition-colors"
      onClick={onSelect}
    >
      <div className="flex-shrink-0 mt-0.5">
        <div
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
          style={{
            borderColor: isSelected ? YELLOW : '#3F3F46',
            backgroundColor: isSelected ? 'rgba(246, 183, 74, 0.1)' : 'transparent',
          }}
        >
          {isSelected && (
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: YELLOW,
              }}
            />
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-neutral-100">{title}</div>
        <div className="text-[11px] text-neutral-400 mt-0.5">{description}</div>
      </div>
    </div>
  );
};

export default function SimulatorExpandable({ darkMode }: { darkMode: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [enabled, setEnabled] = useBrowserStorage<boolean>(
    'local',
    FEATURE_KEYS.SIMULATOR,
    FEATURE_DEFAULTS[FEATURE_KEYS.SIMULATOR],
  );
  const [showEveryTx, setShowEveryTx] = useBrowserStorage<boolean>(
    'local',
    FEATURE_KEYS.SIMULATOR_SHOW_EVERY_TX,
    FEATURE_DEFAULTS[FEATURE_KEYS.SIMULATOR_SHOW_EVERY_TX],
  );
  const [warningsOnly, setWarningsOnly] = useBrowserStorage<boolean>(
    'local',
    FEATURE_KEYS.SIMULATOR_WARNINGS_ONLY,
    FEATURE_DEFAULTS[FEATURE_KEYS.SIMULATOR_WARNINGS_ONLY],
  );

  if (showEveryTx === undefined || warningsOnly === undefined || enabled === undefined) return null;

  const onSwitchClick = () => setEnabled(!enabled);

  const onSwitchKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setEnabled(!enabled);
    }
  };

  return (
    <>
      <div className="py-3 px-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="text-[13px] font-semibold text-neutral-100 break-words">Transaction Simulator</div>
              <button
                type="button"
                onClick={() => setShowInfo(!showInfo)}
                className="flex-shrink-0 text-neutral-400 hover:text-neutral-200 transition-colors"
                aria-label="More info about Transaction Simulator"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 7.5V11.5M8 5.5V5.51" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="text-[12px] leading-snug break-words text-neutral-400">Preview before signing</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={!!enabled}
              aria-label="Transaction Simulator"
              onClick={onSwitchClick}
              onKeyDown={onSwitchKeyDown}
              className="relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex-shrink-0"
              style={{
                width: 44,
                height: 24,
                background: enabled ? YELLOW : '#3F3F46',
                boxShadow: darkMode ? 'none' : undefined,
              }}
            >
              <span
                className="absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full transition-transform shadow"
                style={{
                  background: '#FFFFFF',
                  transform: enabled ? 'translateX(20px)' : 'translateX(0px)',
                }}
              />
            </button>

            {enabled && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="text-neutral-400 hover:text-neutral-200 transition-colors p-1 flex-shrink-0"
                aria-label="Expand simulator options"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {enabled && expanded && (
          <div className="mt-3 space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 px-3 mb-2">
              Display Mode
            </div>
            <SimulatorModeOption
              id="once-per-dapp"
              title="First time + on warnings (Recommended)"
              description="Show summary first time you use a dApp, and again if warnings are detected."
              isSelected={!showEveryTx && !warningsOnly}
              onSelect={() => {
                setShowEveryTx(false);
                setWarningsOnly(false);
              }}
            />
            <SimulatorModeOption
              id="warnings-only"
              title="Only on warnings"
              description="Only show if we detect a problem. Never show on first use."
              isSelected={!showEveryTx && !!warningsOnly}
              onSelect={() => {
                setShowEveryTx(false);
                setWarningsOnly(true);
              }}
            />
            <SimulatorModeOption
              id="every-transaction"
              title="Show Every Transaction"
              description="Always show simulation popup for every transaction."
              isSelected={!!showEveryTx}
              onSelect={() => {
                setShowEveryTx(true);
                setWarningsOnly(false);
              }}
            />
          </div>
        )}
      </div>

      {showInfo && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowInfo(false)}
          style={{ margin: 0 }}
        >
          <div
            className="bg-[#0E0E0E] rounded-xl p-4 max-w-sm w-full border border-[#2A2A2A] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-semibold text-neutral-100">Transaction Simulator</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="text-neutral-400 hover:text-neutral-200 transition-colors"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <p className="text-[12px] leading-relaxed text-neutral-300 whitespace-pre-line">
              The Transaction Simulator analyzes your transaction, showing you exactly what will happen - including
              token transfers, approvals, and potential security risks.
              <span className="block mt-3 font-semibold text-neutral-100">Display Modes:</span>
              <span className="block mt-2">
                <span className="font-semibold text-neutral-100">First time + on warnings:</span> Shows the summary the
                first time you use a dApp. After that, it only appears if a warning is detected.
              </span>
              <span className="block mt-2">
                <span className="font-semibold text-neutral-100">Only on warnings:</span> Only displays when a warning
                is detected.
              </span>
              <span className="block mt-2">
                <span className="font-semibold text-neutral-100">Show Every Transaction:</span> Always displays the
                simulation popup for every transaction.
              </span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
