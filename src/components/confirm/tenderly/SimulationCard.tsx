import React from 'react';

/** ===== Helpers ===== */
const NATIVE_META: Record<string, { symbol: string; decimals: number; emoji: string; logo: string }> = {
  '1': {
    symbol: 'ETH',
    decimals: 18,
    emoji: '◎',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  },
  '10': {
    symbol: 'ETH',
    decimals: 18,
    emoji: '◎',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  },
  '56': {
    symbol: 'BNB',
    decimals: 18,
    emoji: '🟡',
    logo: 'https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  },
  '137': {
    symbol: 'MATIC',
    decimals: 18,
    emoji: '🔷',
    logo: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
  },
  '42161': {
    symbol: 'ETH',
    decimals: 18,
    emoji: '◎',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  },
  '8453': {
    symbol: 'ETH',
    decimals: 18,
    emoji: '◎',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  },
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

function usdLine(symbol: string, amountStr: string, usdPrice?: number) {
  if (!usdPrice) return null;
  const n = Number(amountStr || '0');
  if (!isFinite(n)) return null;
  const usd = n * usdPrice;
  return (
    <div className="text-xs text-neutral-400 mt-0.5">
      ${usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
    </div>
  );
}

const addrEq = (a?: string | null, b?: string | null) => !!a && !!b && a.toLowerCase() === b.toLowerCase();

/** Small icon component w/ graceful fallback */
function TokenIcon({ url, emoji, alt, size = 18 }: { url?: string; emoji?: string; alt?: string; size?: number }) {
  const [err, setErr] = React.useState(false);
  if (!url || err) {
    return (
      <span className="inline-block" style={{ width: size, height: size, lineHeight: `${size}px` }}>
        {emoji || '🪙'}
      </span>
    );
  }
  return (
    <img
      src={url}
      alt={alt || 'token'}
      width={size}
      height={size}
      className="inline-block rounded-full"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setErr(true)}
    />
  );
}

/** ===== Types from your payload ===== */
type TenderlyResponse = {
  transaction: {
    from: string;
    to?: string;
    value?: string; // hex
    gas_price?: number;
    gas_used?: number;
    effective_gas_price?: number;
    network_id?: string;
    transaction_info?: {
      asset_changes?: Array<{
        type: 'Transfer' | 'Mint' | string;
        from?: string;
        to?: string;
        amount?: string;
        raw_amount?: string;
        token_info?: {
          standard?: 'ERC20' | 'NativeCurrency' | string;
          symbol?: string;
          decimals?: number;
          dollar_value?: string | number; // price per token
          logo?: string;
        };
      }>;
    };
  };
};

export default function EstimatedChangesFromTenderly({
  data,
  className,
}: {
  data: TenderlyResponse;
  /** optional extra classes to override width, etc. */
  className?: string;
}) {
  const tx = data?.transaction;
  const user = tx?.from;
  const chain = NATIVE_META[String(tx?.network_id ?? '')] ?? {
    symbol: 'ETH',
    decimals: 18,
    emoji: '◎',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  };

  // --- You send (native) ---
  const nativeSendRawWei = toDecString(tx?.value ?? '0x0');
  const nativeSend = formatUnits(nativeSendRawWei, chain.decimals);
  const nativeSendPretty = compact(nativeSend);

  // Optional gas fee
  const gasPriceWei = toDecString(tx?.effective_gas_price ?? tx?.gas_price ?? 0);
  const gasUsed = toDecString(tx?.gas_used ?? 0);
  const gasFeeWei =
    /^\d+$/.test(gasPriceWei) && /^\d+$/.test(gasUsed) ? (BigInt(gasPriceWei) * BigInt(gasUsed)).toString() : '0';
  const gasFee = formatUnits(gasFeeWei, chain.decimals);
  const gasFeePretty = compact(gasFee);

  // --- You receive (first ERC20 transfer to user) ---
  const assets = tx?.transaction_info?.asset_changes ?? [];
  const primaryReceive = assets.find(
    (a) => a.type === 'Transfer' && a.token_info?.standard === 'ERC20' && addrEq(a.to, user),
  );

  const receiveSymbol = (primaryReceive?.token_info?.symbol || 'TOKEN').toUpperCase();
  const receiveDecimals = primaryReceive?.token_info?.decimals ?? 18;
  const receiveLogo = primaryReceive?.token_info?.logo; // real logo
  const receiveAmount = primaryReceive?.raw_amount
    ? formatUnits(primaryReceive.raw_amount, receiveDecimals)
    : primaryReceive?.amount || '0';
  const receivePretty = compact(receiveAmount);
  const receiveUsdPrice =
    primaryReceive?.token_info?.dollar_value != null ? Number(primaryReceive.token_info.dollar_value) : undefined;

  return (
    <div
      className={[
        'rounded-xl border border-neutral-800 bg-neutral-900 p-5 text-white shadow-sm',
        'w-[90%] mx-auto max-w-none', // ⬅️ 90% wide, centered, no max clamp
        className || '',
      ].join(' ')}
    >
      <div className="text-sm font-medium mb-3">Estimated changes</div>

      {/* You send */}
      <div className="flex items-center justify-between py-2">
        <div className="text-sm text-neutral-300">You send</div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-700/40">
            − {nativeSendPretty}
          </span>
          <span className="flex items-center gap-2 text-sm">
            <TokenIcon url={chain.logo} emoji={chain.emoji} alt={chain.symbol} />
            <span className="font-medium">{chain.symbol}</span>
          </span>
        </div>
      </div>
      {/* If you have a BNB USD price, pass it into usdLine here */}
      {/* {usdLine(chain.symbol, nativeSend, bnbUsdPrice)} */}

      {/* You receive */}
      <div className="flex items-center justify-between py-2">
        <div className="text-sm text-neutral-300">You receive</div>
        {primaryReceive ? (
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-700/40">
              + {receivePretty}
            </span>
            <span className="flex items-center gap-2 text-sm">
              <TokenIcon url={receiveLogo} emoji="🪙" alt={receiveSymbol} />
              <span className="font-medium uppercase">{receiveSymbol}</span>
            </span>
          </div>
        ) : (
          <div className="text-sm text-neutral-400">—</div>
        )}
      </div>
      {primaryReceive && usdLine(receiveSymbol, receiveAmount, receiveUsdPrice)}

      {/* Footer */}
      {/* <div className="mt-4 flex items-center justify-between text-xs text-neutral-400">
        <div>Estimated gas: {gasFeeWei === '0' ? '—' : `${gasFeePretty} ${chain.symbol}`}</div>
      </div> */}
    </div>
  );
}
