import React from 'react';
import { useAssetCheck } from '../../../lib/chainpatrol/useAssetCheck';
import { CHAINPATROL_API_KEY } from '../../../lib/constants';
import { toCaip2 } from '../../../lib/chainpatrol/chainpatrol';

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
const EXPLORER_BASE: Record<string, string> = {
  '1': 'https://etherscan.io',
  '10': 'https://optimistic.etherscan.io',
  '56': 'https://bscscan.com',
  '137': 'https://polygonscan.com',
  '42161': 'https://arbiscan.io',
  '8453': 'https://basescan.org',
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
function abbreviateLargeDecimal(x: string): string {
  if (!x || /<\s*/.test(x)) return x;
  const s = String(x).replace(/,/g, '');
  if (!/^\d+(?:\.\d+)?$/.test(s)) return x;
  const [intRaw, fracRaw = ''] = s.split('.');
  const int = intRaw.replace(/^0+/, '') || '0';
  const len = int.length;
  if (len < 7) return x; // < 1,000,000
  const UNITS = ['', 'K', 'M', 'B', 'T', 'Q'];
  const idx = Math.min(Math.floor((len - 1) / 3), UNITS.length - 1);
  const unit = UNITS[idx];
  const baseDigits = len - idx * 3;
  const leading = int.slice(0, baseDigits);
  const rest = (int.slice(baseDigits) + fracRaw).replace(/[^0-9]/g, '');
  const dec = rest[0] || '0';
  const decimal = dec === '0' ? '' : `.${dec}`;
  return `${leading}${decimal}${unit}`;
}
function prettyWithFloor(x: string, floorDp = 6) {
  const n = Number(x);
  if (!isFinite(n) || n === 0) return '0';
  const floor = 10 ** -floorDp;
  if (n > 0 && n < floor) return `<${floor.toFixed(floorDp)}`;
  return compact(x);
}
function usdPretty(amountStr: string, price?: number) {
  if (!price) return null;
  const n = Number(amountStr || '0');
  if (!isFinite(n)) return null;
  const usd = n * price;
  const text = usd > 0 && usd < 0.01 ? '< $0.01' : `$${usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  return <div className="text-xs text-neutral-400 mt-1">{text}</div>;
}
const addrEq = (a?: string | null, b?: string | null) => !!a && !!b && a.toLowerCase() === b.toLowerCase();
const shortAddr = (a?: string) => (!a ? '' : `${a.slice(0, 6)}…${a.slice(-4)}`);

function TokenIcon({ url, emoji, alt, size = 16 }: { url?: string; emoji?: string; alt?: string; size?: number }) {
  const [err, setErr] = React.useState(false);
  if (!url || err) return <span style={{ width: size, height: size, lineHeight: `${size}px` }}>🟦</span>;
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

type AssetChange = {
  type: 'Transfer' | 'Mint' | string;
  from?: string;
  to?: string;
  amount?: string;
  raw_amount?: string;
  token_id?: string;
  token_info?: {
    standard?: 'ERC20' | 'ERC721' | 'ERC1155' | 'NativeCurrency' | string;
    symbol?: string;
    decimals?: number;
    dollar_value?: string | number;
    logo?: string;
    contract_address?: string;
  };
};
type TenderlyResponse = {
  transaction: {
    from: string;
    to?: string;
    value?: string;
    network_id?: string;
    transaction_info?: {
      asset_changes?: Array<AssetChange>;
    };
  };
};

function parseTokenId(id?: string) {
  if (!id) return { display: '', decimal: '', hex: '' };
  try {
    const big = id.startsWith('0x') ? BigInt(id) : BigInt(id);
    return { display: `#${big.toString(10)}`, decimal: big.toString(10), hex: '0x' + big.toString(16) };
  } catch {
    return { display: `#${id}`, decimal: id, hex: '' };
  }
}
function shortenIdDisplay(displayHash: string) {
  const noHash = displayHash.replace(/^#/, '');
  if (noHash.length <= 8) return `#${noHash}`;
  return `#${noHash.slice(0, 4)}…${noHash.slice(-4)}`;
}
function getExplorerUrl(chainId?: string, addr?: string) {
  if (!addr) return undefined;
  const base = EXPLORER_BASE[String(chainId || '')];
  return base ? `${base}/address/${addr}` : undefined;
}

export default function EstimatedChangesFromTenderly({
  data,
  className,
  nativeUsdPrice,
}: {
  data: TenderlyResponse;
  className?: string;
  nativeUsdPrice?: number;
}) {
  const tx = data?.transaction;
  const user = tx?.from;
  const chain = NATIVE_META[String(tx?.network_id ?? '')] ?? {
    symbol: 'ETH',
    decimals: 18,
    emoji: '◎',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  };

  const nativeSendRawWei = toDecString(tx?.value ?? '0x0');
  const nativeSend = formatUnits(nativeSendRawWei, chain.decimals);
  const nativeSendPretty = prettyWithFloor(nativeSend, 6);

  const assetChanges = (tx?.transaction_info?.asset_changes ?? []) as AssetChange[];

  const erc20Receive = assetChanges.find(
    (a) => a.type === 'Transfer' && a.token_info?.standard === 'ERC20' && addrEq(a.to, user),
  );
  const erc20Send = assetChanges.find(
    (a) => a.type === 'Transfer' && a.token_info?.standard === 'ERC20' && addrEq(a.from, user),
  );
  const nftReceive = assetChanges.find(
    (a) =>
      a.type === 'Transfer' &&
      (a.token_info?.standard === 'ERC721' || a.token_info?.standard === 'ERC1155') &&
      addrEq(a.to, user),
  );
  const nftSend = assetChanges.find(
    (a) =>
      a.type === 'Transfer' &&
      (a.token_info?.standard === 'ERC721' || a.token_info?.standard === 'ERC1155') &&
      addrEq(a.from, user),
  );

  const primaryChange = erc20Receive || nftReceive || erc20Send || nftSend || null;
  const primaryStandard = primaryChange?.token_info?.standard;

  const tokenId = parseTokenId(nftReceive?.token_id);
  const nftDisplayId = tokenId.display ? shortenIdDisplay(tokenId.display) : '';

  const parseNftContractFromTokenId = (id?: string) => (id && id.length === 66 ? `0x${id.slice(2, 42)}` : undefined);

  const primaryContract =
    primaryChange?.token_info?.contract_address ||
    (primaryStandard === 'ERC721' || primaryStandard === 'ERC1155'
      ? parseNftContractFromTokenId(primaryChange?.token_id)
      : undefined);

  const counterparty = primaryChange ? (addrEq(primaryChange.to, user) ? primaryChange.from : primaryChange.to) : null;

  const txTarget = tx?.to || null;

  const nftContract =
    nftReceive?.token_info?.contract_address ||
    (nftReceive?.token_id && nftReceive.token_id.length === 66 ? `0x${nftReceive.token_id.slice(2, 42)}` : undefined);
  const nftExplorer = getExplorerUrl(tx?.network_id, nftContract);

  const chainId = tx?.network_id;
  const assetContract = primaryContract || null;
  const caipAsset = assetContract ? toCaip2(chainId, assetContract) : '';
  const caipTxTarget = txTarget ? toCaip2(chainId, txTarget) : '';
  const caipCounterparty = counterparty ? toCaip2(chainId, counterparty) : '';

  const assetCheck = useAssetCheck(caipAsset, CHAINPATROL_API_KEY ?? '');
  const txTargetCheck = useAssetCheck(caipTxTarget, CHAINPATROL_API_KEY ?? '');
  const counterpartyCheck = useAssetCheck(caipCounterparty, CHAINPATROL_API_KEY ?? '');

  const isBlocked = (s?: string) => (s || '').toUpperCase() === 'BLOCKED';
  const showWarnings =
    isBlocked(assetCheck.status) || isBlocked(txTargetCheck.status) || isBlocked(counterpartyCheck.status);

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

  // Build a single warning message that combines everything
  const warningParts: string[] = [];
  if (assetContract && isBlocked(assetCheck.status)) {
    const prefix = primaryStandard === 'ERC20' ? 'Token' : 'Collection';
    warningParts.push(`${prefix}: ${shortAddr(assetContract)}`);
  }
  if (txTarget && isBlocked(txTargetCheck.status)) {
    warningParts.push(`Target: ${shortAddr(txTarget)}`);
  }
  if (counterparty && isBlocked(counterpartyCheck.status)) {
    const label = erc20Receive || nftReceive ? 'Sender' : 'Recipient';
    warningParts.push(`${label}: ${shortAddr(counterparty)}`);
  }
  const warningMessage = warningParts.length > 0 ? warningParts.join(' • ') : 'Malicious';

  return (
    <div className="w-full text-white space-y-3 py-3">
      {/* Compact professional single-line warning banner */}
      {showWarnings && (
        <div className="px-4">
          <div className="rounded-md px-3 py-2 border border-rose-800/60 bg-[#2A0E0E] flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-rose-200 tracking-wide">Malicious token detected</div>
              <div className="text-[11px] font-mono text-rose-300/90 truncate">{warningMessage}</div>
            </div>
          </div>
        </div>
      )}

      {/* You Send Section */}
      <div className="px-4">
        <div className="text-xs text-neutral-500 mb-2">You send</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-semibold text-white" title={nativeSendPretty}>
              {nativeSend === '0' ? '0' : abbreviateLargeDecimal(nativeSendPretty)} {chain.symbol}
            </div>
          </div>
          <TokenIcon url={chain.logo} emoji={chain.emoji} alt={chain.symbol} size={40} />
        </div>
        <div className="text-sm text-neutral-400 mt-1">
          {nativeUsdPrice && nativeSend !== '0'
            ? `$${(Number(nativeSend) * nativeUsdPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
            : ''}
        </div>
      </div>

      {/* Arrow Divider */}
      <div className="flex justify-center py-1">
        <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {/* You Receive Section */}
      <div className="px-4">
        <div className="text-xs text-neutral-500 mb-2">You receive</div>
        {nftReceive ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-semibold text-white">1 {nftReceive.token_info?.symbol || 'NFT'}</div>
              </div>
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-800">
                <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            {nftDisplayId && <div className="text-sm text-neutral-400 mt-1">{nftDisplayId}</div>}
          </>
        ) : erc20Receive ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-semibold text-white">
                  {(() => {
                    const dec = erc20Receive.token_info?.decimals ?? 18;
                    const amt = erc20Receive.raw_amount
                      ? formatUnits(erc20Receive.raw_amount, dec)
                      : erc20Receive.amount || '0';
                    return abbreviateLargeDecimal(compact(amt));
                  })()}{' '}
                  {(erc20Receive.token_info?.symbol || 'TOKEN').toUpperCase()}
                </div>
              </div>
              <TokenIcon
                url={erc20Receive.token_info?.logo}
                emoji="🪙"
                alt={erc20Receive.token_info?.symbol}
                size={40}
              />
            </div>
            <div className="text-sm text-neutral-400 mt-1">
              {erc20Receive.token_info?.dollar_value
                ? `$${Number(erc20Receive.token_info.dollar_value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                : ''}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-2xl font-semibold text-neutral-600">Nothing</div>
          </div>
        )}
      </div>

      {/* Former warnings block removed; compact banner shown at top */}
    </div>
  );
}
