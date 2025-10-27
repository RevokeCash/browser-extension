import React, { useState, useEffect } from 'react';
import { Hash } from 'viem';
import Browser from 'webextension-polyfill';
import MenuItem from '../common/MenuItem';
import Title from '../common/Title';

interface Props {
  requestId: Hash;
  bypassed: boolean;
  tenderlySummary?: any;
  slowMode?: any;
}

const WarningControls = ({ bypassed, requestId, tenderlySummary, slowMode = false }: Props) => {
  const respond = async (data: boolean) => {
    try {
      // Send message - background will close the window
      await Browser.runtime.sendMessage(undefined, { requestId, data });
    } catch (err) {
      console.error('Failed to send response:', err);
      // Only close on error to prevent stuck window
      window.close();
    }
  };

  const confirm = () => respond(true);
  const reject = () => respond(false);
  const dismiss = () => window.close();

  // Show slow mode flow if enabled and we have simulation data
  const showSlowModeFlow = slowMode && tenderlySummary && !bypassed;

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
