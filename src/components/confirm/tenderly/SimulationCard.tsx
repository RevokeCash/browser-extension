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

  return (
    <div
      className={[
        'rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-white shadow-sm',
        'w-[100%] mx-auto max-w-none',
        className || '',
      ].join(' ')}
    >
      <div className="flex items-center gap-1 text-sm font-medium mb-3">
        <span>Estimated changes</span>
      </div>

      <div className="flex items-center justify-between py-2">
        <div className="text-sm text-neutral-300">You send</div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-800/40 max-w-[160px] truncate"
            title={nativeSendPretty}
          >
            {nativeSend === '0' ? '—' : `- ${nativeSendPretty}`}
          </span>
          <span className="flex items-center gap-1.5 text-sm">
            <TokenIcon url={chain.logo} emoji={chain.emoji} alt={chain.symbol} />
            <span className="font-medium">{chain.symbol}</span>
          </span>
        </div>
      </div>
      {usdPretty(nativeSend, nativeUsdPrice)}

      {nftReceive ? (
        <div className="mt-4 pt-4 border-t border-neutral-800">
          <div className="text-sm text-neutral-300 mb-2">You receive (NFT)</div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-800/40 shrink-0">
                + 1
              </span>
              <div className="text-sm font-medium truncate max-w-[56%]" title={nftReceive.token_info?.symbol || 'NFT'}>
                {nftReceive.token_info?.symbol || 'NFT'}
              </div>
              {nftDisplayId && (
                <span
                  className="text-[11px] font-medium rounded-md px-1.5 py-[2px] bg-neutral-800 text-neutral-300 border border-neutral-700 max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap"
                  title={`${tokenId.decimal}${tokenId.hex ? ` (${tokenId.hex})` : ''}`}
                >
                  {nftDisplayId}
                </span>
              )}
            </div>
            {(nftContract || nftReceive.token_info?.standard) && (
              <div className="text-xs text-neutral-400">
                {nftContract ? (
                  <>
                    Contract:{' '}
                    {nftExplorer ? (
                      <a
                        href={nftExplorer}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:no-underline"
                        title={nftContract}
                      >
                        {shortAddr(nftContract)}
                      </a>
                    ) : (
                      <span title={nftContract}>{shortAddr(nftContract)}</span>
                    )}
                    {' • '}
                  </>
                ) : null}
                {(nftReceive.token_info?.standard || 'NFT').toUpperCase()}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between py-3">
          <div className="text-sm text-neutral-300">You receive</div>
          {erc20Receive ? (
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-800/40">
                +{' '}
                {(() => {
                  const dec = erc20Receive.token_info?.decimals ?? 18;
                  const amt = erc20Receive.raw_amount
                    ? formatUnits(erc20Receive.raw_amount, dec)
                    : erc20Receive.amount || '0';
                  return compact(amt);
                })()}
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <TokenIcon url={erc20Receive.token_info?.logo} emoji="🪙" alt={erc20Receive.token_info?.symbol} />
                <span className="font-medium uppercase">
                  {(erc20Receive.token_info?.symbol || 'TOKEN').toUpperCase()}
                </span>
              </span>
            </div>
          ) : (
            <div className="text-sm text-neutral-400">—</div>
          )}
        </div>
      )}

      {showWarnings && (
        <div className="mt-4 pt-3 border-t border-neutral-800">
          {assetContract && isBlocked(assetCheck.status) && (
            <div className="ml-1 mt-2 flex items-center gap-2 text-xs text-neutral-300">
              <span>{primaryStandard === 'ERC20' ? 'Token status:' : 'Collection status:'}</span>
              <a
                href={getExplorerUrl(tx?.network_id, assetContract)}
                target="_blank"
                rel="noreferrer"
                className="underline hover:no-underline"
                title={assetContract}
              >
                {shortAddr(assetContract)}
              </a>
              <CPBadge status={assetCheck.status} reason={assetCheck.details?.reason} />
            </div>
          )}

          {txTarget && isBlocked(txTargetCheck.status) && (
            <div className="ml-1 mt-2 flex items-center gap-2 text-xs text-neutral-300">
              <span>Tx target:</span>
              <a
                href={getExplorerUrl(tx?.network_id, txTarget)}
                target="_blank"
                rel="noreferrer"
                className="underline hover:no-underline"
                title={txTarget}
              >
                {shortAddr(txTarget)}
              </a>
              <CPBadge status={txTargetCheck.status} reason={txTargetCheck.details?.reason} />
            </div>
          )}

          {counterparty && isBlocked(counterpartyCheck.status) && (
            <div className="ml-1 mt-1 flex items-center gap-2 text-xs text-neutral-300">
              <span>{erc20Receive || nftReceive ? 'Token sender:' : 'Token recipient:'}</span>
              <a
                href={getExplorerUrl(tx?.network_id, counterparty)}
                target="_blank"
                rel="noreferrer"
                className="underline hover:no-underline"
                title={counterparty}
              >
                {shortAddr(counterparty)}
              </a>
              <CPBadge status={counterpartyCheck.status} reason={counterpartyCheck.details?.reason} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
