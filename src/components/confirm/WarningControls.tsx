import React, { useState, useEffect } from 'react';
import { Hash } from 'viem';
import Browser from 'webextension-polyfill';
import { useAssetCheck } from '../../lib/chainpatrol/useAssetCheck';
import { CHAINPATROL_API_KEY } from '../../lib/constants';
import { toCaip2 } from '../../lib/chainpatrol/chainpatrol';

interface Props {
  requestId: Hash;
  bypassed: boolean;
  tenderlySummary?: any;
  slowMode?: any;
}

const UI = {
  accent: '#fdb951',
  accentInk: '#111111',
  ghostBorder: '#2a2a2a',
  ink: '#e5e7eb',
};

const btnBase: React.CSSProperties = {
  flex: '1 1 auto',
  height: 52,
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 15,
  cursor: 'pointer',
  transition: 'filter .15s ease, transform .02s ease',
};

const ghostStyle: React.CSSProperties = {
  ...btnBase,
  background: 'transparent',
  color: UI.ink,
  border: `1px solid ${UI.ghostBorder}`,
};

const primaryStyle: React.CSSProperties = {
  ...btnBase,
  background: UI.accent,
  color: UI.accentInk,
  border: 'none',
};

function readQuery() {
  try {
    const p = new URLSearchParams(window.location.search);
    const warningData = p.get('warningData') ? JSON.parse(p.get('warningData')!) : null;
    const tenderlySummary = p.get('tenderlySummary') ? JSON.parse(p.get('tenderlySummary')!) : null;
    return { warningData, tenderlySummary };
  } catch {
    return { warningData: null, tenderlySummary: null };
  }
}

const WarningControls = ({ bypassed, requestId, slowMode = false }: Props) => {
  const { warningData, tenderlySummary } = React.useMemo(readQuery, []);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const confirmedKey = React.useMemo(() => `slowmode_confirmed:${String(requestId ?? '')}`, [requestId]);
  const CONFIRM_TTL_MS = 3_000;
  const [confirmedPersisted, setConfirmedPersisted] = useState<boolean>(() => {
    try {
      const raw = sessionStorage.getItem(confirmedKey);
      if (!raw) return false;
      const ts = Number(raw);
      if (!isFinite(ts)) {
        sessionStorage.removeItem(confirmedKey);
        return false;
      }
      const fresh = Date.now() - ts <= CONFIRM_TTL_MS;
      if (!fresh) sessionStorage.removeItem(confirmedKey);
      return fresh;
    } catch {
      return false;
    }
  });

  const logPopupEvent = async (approved: boolean) => {
    try {
      const userAddress: string | undefined =
        warningData?.address ??
        warningData?.spender ??
        tenderlySummary?.transaction?.from ??
        tenderlySummary?.from ??
        undefined;

      const simulationSummary = tenderlySummary
        ? {
            estimatedGas: tenderlySummary?.simulation?.gas ?? tenderlySummary?.gas ?? undefined,
            changes: tenderlySummary?.balance_diff
              ? Object.entries(tenderlySummary.balance_diff).map(([token, delta]: any) => ({
                  token,
                  delta: String(delta),
                }))
              : undefined,
            risks: warningData?.type ? [String(warningData.type)] : undefined,
          }
        : undefined;

      const metadata = {
        url: warningData?.hostname ? `https://${warningData.hostname}` : undefined,
        simulationSummary,
        reason: approved ? undefined : 'User rejected in popup',
      };

      await Browser.runtime.sendMessage(undefined, {
        __fs_event__: true,
        kind: approved ? 'popupOK' : 'popupNOK',
        userAddress,
        metadata,
      });
    } catch {}
  };

  const respond = async (data: boolean) => {
    try {
      await logPopupEvent(!!data);
    } finally {
      try {
        await Browser.runtime.sendMessage(undefined, { requestId, data });
      } finally {
        window.close();
      }
    }
  };

  const confirm = () => {
    setHasConfirmed(true);
    try {
      sessionStorage.setItem(confirmedKey, String(Date.now()));
      setConfirmedPersisted(true);
    } catch {}
    return respond(true);
  };
  const reject = () => respond(false);
  const dismiss = () => window.close();

  const showSlowModeFlow = slowMode && tenderlySummary && !bypassed && !hasConfirmed && !confirmedPersisted;
  if (showSlowModeFlow) {
    return <SlowModeFlow data={tenderlySummary} onConfirm={confirm} onReject={reject} />;
  }

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        gap: 12,
        marginTop: 12,
        padding: '0 16px 20px 16px', // 👈 added bottom padding
      }}
    >
      {bypassed ? (
        <button
          onClick={dismiss}
          style={ghostStyle}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(1px)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
        >
          DISMISS
        </button>
      ) : (
        <>
          <button
            onClick={reject}
            style={ghostStyle}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(1px)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
          >
            REJECT
          </button>
          <button
            onClick={confirm}
            style={primaryStyle}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(1px)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
          >
            CONFIRM
          </button>
        </>
      )}
    </div>
  );
};

export default WarningControls;

const NATIVE_META: Record<string, { symbol: string; decimals: number; logo: string }> = {
  '1': { symbol: 'ETH', decimals: 18, logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
  '10': { symbol: 'ETH', decimals: 18, logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
  '56': {
    symbol: 'BNB',
    decimals: 18,
    logo: 'https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  },
  '137': {
    symbol: 'MATIC',
    decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
  },
  '42161': { symbol: 'ETH', decimals: 18, logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
  '8453': { symbol: 'ETH', decimals: 18, logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
};

const SlowModeFlow = ({ data, onConfirm, onReject }: { data: any; onConfirm: () => void; onReject: () => void }) => {
  // ... (rest of the component unchanged except for button colors below)
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const HOLD_DELAY = 1750;

  const startHolding = () => {
    setIsHolding(true);
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min((elapsed / HOLD_DELAY) * 100, 100);
      setHoldProgress(progress);
      if (progress >= 100) {
        setIsHolding(false);
        setHoldProgress(0);
        onConfirm();
      } else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const stopHolding = () => setIsHolding(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800 shadow-2xl w-full max-w-xl">
        {/* Hold to Confirm */}
        <div className="space-y-4">
          <div className="relative">
            <button
              onMouseDown={startHolding}
              onMouseUp={stopHolding}
              onMouseLeave={stopHolding}
              className="relative w-full h-14 rounded-xl overflow-hidden font-medium text-white text-base transition-all duration-200 disabled:opacity-50 border-2"
              style={{
                backgroundColor: '#27272a',
                borderColor: isHolding ? UI.accent : '#3f3f46',
              }}
            >
              <div
                className="absolute inset-0 transition-all ease-linear"
                style={{
                  background: UI.accent,
                  width: `${holdProgress}%`,
                  opacity: holdProgress > 0 ? 1 : 0,
                }}
              />
              <span className="relative z-10 font-semibold">
                {holdProgress === 0 ? 'Hold to Confirm' : holdProgress >= 100 ? 'Confirming...' : 'Keep Holding...'}
              </span>
            </button>
          </div>

          {/* Cancel (ghost style, consistent) */}
          <button
            onClick={onReject}
            style={ghostStyle}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(1px)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
          >
            Cancel transaction
          </button>
        </div>
      </div>
    </div>
  );
};
