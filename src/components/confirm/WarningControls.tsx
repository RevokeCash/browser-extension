import React, { useState, useEffect } from 'react';
import { Hash } from 'viem';
import Browser from 'webextension-polyfill';
import MenuItem from '../common/MenuItem';
import Title from '../common/Title';
import { useAssetCheck } from '../../lib/chainpatrol/useAssetCheck';
import { CHAINPATROL_API_KEY } from '../../lib/constants';
import { toCaip2 } from '../../lib/chainpatrol/chainpatrol';

interface Props {
  requestId: Hash;
  bypassed: boolean;
  tenderlySummary?: any;
  slowMode?: any;
}

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

  // Persist confirmation to survive remounts triggered by wallet popup focus changes
  const confirmedKey = React.useMemo(() => `slowmode_confirmed:${String(requestId ?? '')}`, [requestId]);
  const CONFIRM_TTL_MS = 3_000; // 3 seconds
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

  // Show slow mode flow if enabled and we have simulation data
  const showSlowModeFlow = slowMode && tenderlySummary && !bypassed && !hasConfirmed && !confirmedPersisted;

  if (showSlowModeFlow) {
    return <SlowModeFlow data={tenderlySummary} onConfirm={confirm} onReject={reject} />;
  }

  // Standard buttons
  return (
    <div className="flex w-full h-16 divide-x divide-neutral-800 mt-3 shrink-0 bg-neutral-950">
      {bypassed ? (
        <WarningControlsButton onClick={dismiss}>Dismiss</WarningControlsButton>
      ) : (
        <>
          <WarningControlsButton onClick={reject}>Reject</WarningControlsButton>
          <WarningControlsButton onClick={confirm}>Continue</WarningControlsButton>
        </>
      )}
    </div>
  );
};

export default WarningControls;

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

const WarningControlsButton = ({ children, onClick }: ButtonProps) => {
  return (
    <button onClick={onClick} className="grow">
      <MenuItem
        size="small"
        className="
          bg-neutral-900 
          text-neutral-200 
          hover:text-white 
          hover:bg-neutral-800 
          h-full w-full 
          justify-center 
          transition-colors duration-150
          border border-neutral-800
        "
      >
        <Title>{children}</Title>
      </MenuItem>
    </button>
  );
};

// Slow Mode Flow Component (embedded in WarningControls)
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

const EXPLORER_BASE: Record<string, string> = {
  '1': 'https://etherscan.io',
  '10': 'https://optimistic.etherscan.io',
  '56': 'https://bscscan.com',
  '137': 'https://polygonscan.com',
  '42161': 'https://arbiscan.io',
  '8453': 'https://basescan.org',
};

const getExplorerUrl = (networkId: string | number | undefined, address?: string | null) => {
  if (!address || !networkId) return undefined;
  const base = EXPLORER_BASE[String(networkId)];
  return base ? `${base}/address/${address}` : undefined;
};

const toDecString = (v: any) => {
  if (v == null) return '0';
  try {
    if (typeof v === 'bigint') return v.toString();
    if (typeof v === 'number') return Math.trunc(v).toString();
    if (typeof v === 'string' && /^0x/i.test(v)) return BigInt(v).toString();
    return String(v);
  } catch {
    return '0';
  }
};

function formatUnits(raw: string, decimals: number): string {
  if (!/^\d+$/.test(raw)) return '0';
  if (raw === '0') return '0';
  const len = raw.length;
  if (len <= decimals) {
    const s = `0.${'0'.repeat(decimals - len)}${raw}`.replace(/\.?0+$/, '');
    return s || '0';
  }
  const i = raw.slice(0, len - decimals);
  const f = raw.slice(len - decimals).replace(/0+$/, '');
  return f ? `${i}.${f}` : i;
}

const compact = (x: string) => {
  const [i, f = ''] = x.split('.');
  const trimmed = f.slice(0, 6).replace(/0+$/, '');
  return trimmed ? `${i}.${trimmed}` : i;
};

function prettyWithFloor(x: string, floorDp = 6) {
  const n = Number(x);
  if (!isFinite(n) || n === 0) return '0';
  const floor = 10 ** -floorDp;
  if (n > 0 && n < floor) return `<${floor.toFixed(floorDp)}`;
  return compact(x);
}

const addrEq = (a?: string | null, b?: string | null) => !!a && !!b && a.toLowerCase() === b.toLowerCase();

const shortAddr = (addr?: string) => {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

function TokenIcon({ url, size = 20 }: { url?: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (!url || err) return <span style={{ width: size, height: size }} className="rounded-full bg-neutral-700" />;
  return (
    <img
      src={url}
      alt="token"
      width={size}
      height={size}
      className="inline-block rounded-full"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setErr(true)}
    />
  );
}

interface SlowModeFlowProps {
  data: any;
  onConfirm: () => void;
  onReject: () => void;
}

const SlowModeFlow = ({ data, onConfirm, onReject }: SlowModeFlowProps) => {
  const [step, setStep] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const startTimeRef = React.useRef<number | null>(null);
  const holdIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);

  const tx = data?.transaction;
  const user = tx?.from;
  const recipient = tx?.to;
  const chain = NATIVE_META[String(tx?.network_id ?? '')] ?? {
    symbol: 'ETH',
    decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  };

  const nativeSendRawWei = toDecString(tx?.value ?? '0x0');
  const nativeSend = formatUnits(nativeSendRawWei, chain.decimals);
  const nativeSendPretty = prettyWithFloor(nativeSend, 6);

  const assets = (tx?.transaction_info?.asset_changes ?? []) as any[];
  const erc20Receive = assets.find(
    (a: any) => a.type === 'Transfer' && a.token_info?.standard === 'ERC20' && addrEq(a.to, user),
  );
  const nftReceive = assets.find(
    (a: any) =>
      a.type === 'Transfer' &&
      (a.token_info?.standard === 'ERC721' || a.token_info?.standard === 'ERC1155') &&
      addrEq(a.to, user),
  );

  const receiveFrom = erc20Receive?.from || nftReceive?.from;
  const receivingNothing = !erc20Receive && !nftReceive;
  const sendingNothing = nativeSend === '0';

  // Extract asset contract for checking
  const assetContract = erc20Receive?.token_info?.contract_address || nftReceive?.token_info?.contract_address;
  const chainId = tx?.network_id;
  const caipAsset = assetContract ? toCaip2(chainId, assetContract) : '';
  const assetCheck = useAssetCheck(caipAsset, CHAINPATROL_API_KEY ?? '');

  const isBlocked = (s?: string) => (s || '').toUpperCase() === 'BLOCKED';
  const showMaliciousWarning = isBlocked(assetCheck.status);

  const CPBadge: React.FC<{ status?: string; reason?: string }> = ({ status, reason }) => {
    const base = 'text-[10px] px-2 py-[2px] rounded-full border';
    if (status === 'LOADING')
      return <span className={`${base} border-neutral-700 bg-[#1A1A1A] text-neutral-300`}>Checking…</span>;
    if (status === 'BLOCKED')
      return (
        <span className={`${base} border-rose-800/40 bg-[#2F0F0F] text-[#F87171]`}>
          ● Malicious{reason ? ` (${reason})` : ''}
        </span>
      );
    if (status === 'ALLOWED' || status === 'SAFE')
      return <span className={`${base} border-emerald-800/40 bg-[#0F2F22] text-[#6EE7B7]`}>● Safe</span>;
    return <span className={`${base} border-neutral-700 bg-[#1A1A1A] text-neutral-300`}>● Unknown</span>;
  };

  const HOLD_DELAY = 1750; // 1.5 seconds

  const startHolding = () => {
    setIsHolding(true);
    startTimeRef.current = Date.now();

    const updateProgress = () => {
      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min((elapsed / HOLD_DELAY) * 100, 100);
        setHoldProgress(progress);

        if (progress >= 100) {
          stopHolding();
          onConfirm();
        } else {
          animationFrameRef.current = requestAnimationFrame(updateProgress);
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const stopHolding = () => {
    setIsHolding(false);
    setHoldProgress(0);
    startTimeRef.current = null;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (holdIntervalRef.current !== null) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopHolding();
    };
  }, []);

  // Auto-advance steps (1 second per step)
  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => setStep(1), 1500);
      return () => clearTimeout(timer);
    } else if (step === 1) {
      const timer = setTimeout(() => setStep(2), 1500);
      return () => clearTimeout(timer);
    }
  }, [step, receivingNothing]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 slowmode-container-entrance">
      <div className="relative w-full max-w-xl mx-4 slowmode-container-entrance">
        {/* Close/Reject button */}
        {/* <button
          onClick={onReject}
          className="absolute -top-12 right-0 text-neutral-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button> */}

        {/* Main content */}
        <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="space-y-4">
            {/* Step 0: Sending */}
            {step >= 0 && (
              <div className={`transition-all duration-700 ease-in-out ${step === 0 ? 'slowmode-slide-in' : ''}`}>
                <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
                  <div className="text-neutral-400 text-xs uppercase tracking-wider mb-3">You are sending</div>
                  {!sendingNothing ? (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <TokenIcon url={chain.logo} size={28} />
                        <div className="text-3xl font-bold text-white">{nativeSendPretty}</div>
                        <div className="text-xl text-neutral-300">{chain.symbol}</div>
                      </div>
                      {recipient && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-neutral-500">to</span>
                          <span className="text-neutral-300 font-mono">{shortAddr(recipient)}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-3xl font-bold text-neutral-500">Nothing</div>
                  )}
                </div>
              </div>
            )}

            {/* Step 1: Receiving */}
            {step >= 1 && (
              <div className={`transition-all duration-700 ease-in-out ${step === 1 ? 'slowmode-slide-in' : ''}`}>
                <div
                  className={`rounded-xl p-4 border ${
                    receivingNothing ? 'bg-red-500/10 border-red-500/30' : 'bg-neutral-800/50 border-neutral-700/50'
                  }`}
                >
                  <div className="text-neutral-400 text-xs uppercase tracking-wider mb-3">And then receiving</div>
                  {receivingNothing ? (
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-red-500">Nothing??</div>
                      <div className="text-red-400/90 text-xs font-medium">
                        ⚠️ You're sending {nativeSendPretty} {chain.symbol} for nothing
                      </div>
                    </div>
                  ) : erc20Receive ? (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <TokenIcon url={erc20Receive.token_info?.logo} size={28} />
                        <div className="text-3xl font-bold text-emerald-400">
                          {(() => {
                            const dec = erc20Receive.token_info?.decimals ?? 18;
                            const amt = erc20Receive.raw_amount
                              ? formatUnits(erc20Receive.raw_amount, dec)
                              : erc20Receive.amount || '0';
                            return compact(amt);
                          })()}
                        </div>
                        <div className="text-xl text-neutral-300">{erc20Receive.token_info?.symbol || 'TOKEN'}</div>
                      </div>
                      {receiveFrom && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-neutral-500">from</span>
                          <span className="text-emerald-400/70 font-mono">{shortAddr(receiveFrom)}</span>
                        </div>
                      )}
                    </>
                  ) : nftReceive ? (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl font-bold text-emerald-400">1 NFT</div>
                        <div className="text-lg text-neutral-300">{nftReceive.token_info?.symbol || 'NFT'}</div>
                      </div>
                      {receiveFrom && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-neutral-500">from</span>
                          <span className="text-emerald-400/70 font-mono">{shortAddr(receiveFrom)}</span>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            )}

            {/* Token Status */}
            {step >= 1 && showMaliciousWarning && assetContract && (
              <div className="transition-all duration-700 ease-in-out">
                <div className="mt-3 pt-3 border-t border-neutral-800">
                  <div className="flex items-center gap-2 text-xs text-neutral-300">
                    <span>Token status:</span>
                    <a
                      href={getExplorerUrl(chainId, assetContract)}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:no-underline"
                      title={assetContract}
                    >
                      {shortAddr(assetContract)}
                    </a>
                    <CPBadge status={assetCheck.status} reason={assetCheck.details?.reason} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Hold to proceed */}
            {step >= 2 && (
              <div className="space-y-4 pt-2 slowmode-slide-in">
                <div className="text-center space-y-2">
                  <div className="text-lg font-medium text-white transition-all duration-300">Ready to proceed?</div>
                  {!isHolding && receivingNothing && !sendingNothing && (
                    <div className="text-red-400 text-sm font-medium">⚠️ Double check this transaction</div>
                  )}
                </div>

                {/* Hold to Confirm button */}
                <div className="relative">
                  <button
                    onMouseDown={startHolding}
                    onMouseUp={stopHolding}
                    onMouseLeave={stopHolding}
                    onTouchStart={startHolding}
                    onTouchEnd={stopHolding}
                    className="relative w-full h-14 rounded-xl overflow-hidden font-medium text-white text-base transition-all duration-200 disabled:opacity-50 border-2"
                    style={{
                      backgroundColor: '#27272a',
                      borderColor: isHolding ? '#f97316' : '#3f3f46',
                    }}
                  >
                    {/* Progress bar fill - left to right */}
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 transition-all duration-75 ease-linear"
                      style={{
                        width: `${holdProgress}%`,
                        opacity: holdProgress > 0 ? 1 : 0,
                      }}
                    />

                    {/* Animated shine effect when holding */}
                    {isHolding && (
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                        style={{
                          animation: 'shimmer 1s infinite',
                        }}
                      />
                    )}

                    {/* Button text with better contrast */}
                    <span className="relative z-10 drop-shadow-lg font-semibold">
                      {holdProgress === 0
                        ? 'Hold to Confirm'
                        : holdProgress >= 100
                          ? 'Confirming...'
                          : 'Keep Holding...'}
                    </span>
                  </button>
                </div>

                {/* Cancel button */}
                <button
                  onClick={onReject}
                  className="w-full h-12 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors text-neutral-300 hover:text-white text-sm"
                >
                  Cancel transaction
                </button>
              </div>
            )}
          </div>

          {/* Step indicator dots */}
          <div className="flex justify-center gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${
                  i === step ? 'w-8 bg-orange-500' : i < step ? 'w-1.5 bg-orange-500/50' : 'w-1.5 bg-neutral-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
