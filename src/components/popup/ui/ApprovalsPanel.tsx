import React, { useEffect, useState } from 'react';
import { GhostButton } from './controls';
import Modal from './Modal';
import useBrowserStorage from '../../../hooks/useBrowserStorage';
import { fetchAllowances, mapAllowancesToUIFormat } from '../../../lib/utils/events-fetcher';
import { getJsonCookie, setJsonCookie } from '../../../lib/utils/cookies';
import type { Address } from 'viem';
import { useTranslations } from '../../../i18n';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
    };
  }
}

type Wallet = {
  id: string;
  label: string;
  address: string;
  enabled: boolean;
};

type Approval = {
  token: string;
  spender: string;
  spenderLabel: string;
  allowance: string;
};

function truncateMiddle(address: string, head = 5, tail = 5) {
  if (!address) return '';
  if (address.length <= head + tail) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

function WalletPill({
  label,
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  prevLabel: string;
  nextLabel: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        aria-label={prevLabel}
        className="h-7 w-7 rounded-[10px] border border-[#1E1E1E] bg-[#0E0E0E] grid place-items-center"
        onClick={onPrev}
      >
        <span className="text-neutral-300">◀</span>
      </button>
      <div className="px-3 py-1.5 rounded-[10px] bg-[#0E0E0E] border border-[#1E1E1E] text-[12px] font-semibold">
        {label}
      </div>
      <button
        aria-label={nextLabel}
        className="h-7 w-7 rounded-[10px] border border-[#1E1E1E] bg-[#0E0E0E] grid place-items-center"
        onClick={onNext}
      >
        <span className="text-neutral-300">▶</span>
      </button>
    </div>
  );
}

const STORAGE_KEY = 'approvals.watchlist';

function CopyButton({
  value,
  size = 14,
  className,
  ariaLabel,
}: {
  value: string;
  size?: number;
  className?: string;
  ariaLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard(text: string) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      try {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.focus();
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      } catch {}
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => copyToClipboard(value)}
      className={`shrink-0 inline-flex items-center justify-center rounded-md hover:bg-[#141414] border border-transparent hover:border-[#2A2A2A] transition-colors ${
        className || ''
      }`}
      style={{ width: size + 8, height: size + 8 }}
    >
      {copied ? (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neutral-300"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neutral-400"
        >
          <rect x="9" y="9" width="12" height="12" rx="2" />
          <rect x="3" y="3" width="12" height="12" rx="2" />
        </svg>
      )}
    </button>
  );
}

// Helper function to detect connected wallet address
const getConnectedWalletAddress = async (): Promise<string | null> => {
  try {
    if (typeof window !== 'undefined' && window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts?.[0] || null;
    }
  } catch (error) {
    console.warn('Failed to get connected wallet address:', error);
  }
  return null;
};

export default function ApprovalsPanel() {
  const t = useTranslations();
  const [wallets, setWallets] = useBrowserStorage<Wallet[]>('local', STORAGE_KEY, []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [manageOpen, setManageOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [approvalsState, setApprovalsState] = useState<Approval[]>([]);
  const [lastUpdatedTs, setLastUpdatedTs] = useState<number | null>(null);

  const activeWallet = wallets?.[activeIndex];

  // Helper: render "Updated Xm ago"
  const minutesAgoText = (ts: number | null): string => {
    if (!ts) return '';
    const diffMs = Date.now() - ts;
    const minutes = Math.max(0, Math.floor(diffMs / (60 * 1000)));
    if (minutes < 1) return t('popup.approvals.updated_just_now');
    return t('popup.approvals.updated_minutes_ago', { minutes });
  };

  // Load approvals (optionally bypass cache)
  async function loadApprovals(forceRefresh = false) {
    const enabledWallets = (wallets || []).filter((w) => w.enabled);
    const wallet = enabledWallets[activeIndex] || enabledWallets[0];
    if (!wallet) {
      setApprovalsState([]);
      setLastUpdatedTs(null);
      return;
    }

    try {
      setLoading(true);
      const chainId = 1; // default to Ethereum mainnet for now

      // 1-hour cache in cookies per address+chain
      const cacheKey = `approvals:${chainId}:${wallet.address.toLowerCase()}`;
      const TTL_SECONDS = 60 * 60;

      const now = Date.now();

      if (!forceRefresh) {
        // Try cache first
        const cached = getJsonCookie<{ data: Approval[]; ts: number }>(cacheKey);
        if (
          cached &&
          typeof cached.ts === 'number' &&
          now - cached.ts < TTL_SECONDS * 1000 &&
          Array.isArray(cached.data)
        ) {
          setApprovalsState(cached.data);
          setLastUpdatedTs(cached.ts);
          return;
        }
      }

      // Fetch fresh if no valid cache or forced refresh
      const allowances = await fetchAllowances(wallet.address as Address, chainId);
      const mappedApprovals = mapAllowancesToUIFormat(allowances);
      setApprovalsState(mappedApprovals);

      // Save to cookie cache (1 hour)
      const ts = Date.now();
      setJsonCookie(cacheKey, { data: mappedApprovals, ts }, TTL_SECONDS);
      setLastUpdatedTs(ts);
    } catch (error) {
      console.error('Failed to load approvals:', error);
      setApprovalsState([]);
    } finally {
      setLoading(false);
    }
  }

  // Load approvals for the first enabled wallet when the tab is open
  useEffect(() => {
    loadApprovals(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, JSON.stringify(wallets)]);

  function onPrev() {
    setActiveIndex((i) => (i - 1 + wallets.length) % wallets.length);
  }
  function onNext() {
    setActiveIndex((i) => (i + 1) % wallets.length);
  }

  const hasWallets = Array.isArray(wallets) && wallets.length > 0;

  return (
    <div className="mt-3 rounded-[12px] border border-[#1E1E1E] bg-[#0E0E0E] overflow-hidden">
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="text-[12px] font-semibold tracking-wide uppercase text-neutral-400">
          {t('popup.approvals.title')}
        </div>
        <button
          onClick={() => setManageOpen(true)}
          className="h-8 px-3 rounded-[10px] text-[12px] font-semibold border border-[#1E1E1E] bg-[#0B0B0B]"
        >
          {t('popup.approvals.manage_wallets')}
        </button>
      </div>

      <div className="px-3 pb-3">
        {hasWallets ? (
          <>
            <div className="flex items-center gap-2 text-[13px]">
              <div className="font-semibold">{activeWallet?.label}</div>
              <span className="text-neutral-400">|</span>
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-neutral-400 truncate">{truncateMiddle(activeWallet?.address || '')}</span>
                <CopyButton
                  value={activeWallet?.address || ''}
                  size={12}
                  ariaLabel={t('popup.approvals.copy_address')}
                />
              </div>
            </div>
            <div className="text-[12px] text-neutral-400">
              {loading ? (
                t('common.loading')
              ) : (
                <>
                  {t('popup.approvals.open_approvals', { count: approvalsState.length })}
                  {lastUpdatedTs ? (
                    <span className="ml-2 text-neutral-500">| {minutesAgoText(lastUpdatedTs)}</span>
                  ) : null}
                </>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WalletPill
                  label={activeWallet?.label ?? ''}
                  onPrev={onPrev}
                  onNext={onNext}
                  prevLabel={t('popup.approvals.previous_wallet')}
                  nextLabel={t('popup.approvals.next_wallet')}
                />
                {/* Refresh and Last Updated */}
                <button
                  type="button"
                  aria-label={t('popup.approvals.refresh')}
                  onClick={() => loadApprovals(true)}
                  disabled={loading}
                  className="ml-2 h-7 w-7 rounded-[10px] border border-[#1E1E1E] bg-[#0E0E0E] grid place-items-center hover:bg-[#141414] disabled:opacity-60"
                  title={t('popup.approvals.refresh')}
                >
                  {loading ? (
                    <svg viewBox="0 0 24 24" width="16" height="16" className="animate-spin text-neutral-300">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.25" />
                      <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="16" height="16" className="text-neutral-300">
                      <path
                        d="M21 12a9 9 0 1 1-3.16-6.84M21 4v6h-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-[12px] text-neutral-400">
                {t('popup.approvals.wallet_position', { current: activeIndex + 1, total: wallets.length })}
              </div>
            </div>

            <div className="mt-3 rounded-[12px] border border-[#1E1E1E] overflow-hidden">
              <div className="grid grid-cols-[1fr,1fr,1fr] px-3 py-2 text-[11px] uppercase text-neutral-400">
                <div>{t('popup.approvals.table.token')}</div>
                <div>{t('popup.approvals.table.spender')}</div>
                <div className="text-right">{t('popup.approvals.table.allowance')}</div>
              </div>
              <div className="h-[1px] bg-[#1A1A1A]" />
              {approvalsState.length === 0 ? (
                <div className="px-3 py-6 text-[13px] text-neutral-400">{t('popup.approvals.no_approvals')}</div>
              ) : (
                <div className="max-h-[360px] overflow-auto">
                  <ul>
                    {approvalsState.map((a, idx) => (
                      <li key={idx} className="px-3 py-3 grid grid-cols-[1fr,1fr,1fr] items-center text-[13px]">
                        <div className="font-medium">{a.token}</div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="truncate">{a.spender}</span>
                            <CopyButton value={a.spender} ariaLabel={t('popup.approvals.copy_address')} />
                          </div>
                          <div className="text-[12px] text-neutral-400 -mt-0.5">{a.spenderLabel}</div>
                        </div>
                        <div className="text-right font-semibold">{a.allowance}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-3 rounded-[10px] border border-[#1E1E1E] bg-[#0B0B0B] text-[13px] text-neutral-300">
            {t('popup.approvals.no_wallets_message')}
            <div className="mt-2">
              <button
                onClick={() => setManageOpen(true)}
                className="h-8 px-3 rounded-[10px] text-[12px] font-semibold border border-[#1E1E1E] bg-[#111111]"
              >
                {t('popup.approvals.add_wallet_cta')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Watchlist Modal */}
      <WalletsModal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        wallets={wallets || []}
        onChangeWallets={setWallets}
        translate={t}
      />
    </div>
  );
}

function WalletsModal({
  open,
  onClose,
  wallets,
  onChangeWallets,
  translate,
}: {
  open: boolean;
  onClose: () => void;
  wallets: Wallet[];
  onChangeWallets: (ws: Wallet[]) => void;
  translate: ReturnType<typeof useTranslations>;
}) {
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');

  function addWallet() {
    const addr = address.trim();
    if (!addr) return;
    const id = Math.random().toString(36).slice(2);
    onChangeWallets([
      ...(wallets || []),
      { id, label: label || translate('popup.approvals.default_label'), address: addr, enabled: true },
    ]);
    setLabel('');
    setAddress('');
  }

  function toggleWallet(id: string) {
    onChangeWallets(wallets.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w)));
  }

  function removeWallet(id: string) {
    onChangeWallets(wallets.filter((w) => w.id !== id));
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="px-3 pt-3 pb-2">
        <div className="text-[18px] font-bold leading-tight">
          {translate('popup.approvals.watchlist_title', { count: wallets.length, limit: 5 })}
        </div>
        <div className="text-[12px] text-neutral-400 mt-1">{translate('popup.approvals.watchlist_subtitle')}</div>
      </div>

      <div className="px-3 pb-3">
        <ul className="space-y-4">
          {wallets.map((w) => (
            <li key={w.id} className="border border-[#2A2A2A] rounded-[12px] p-3 bg-[#0E0E0E]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[14px] font-semibold">{w.label}</div>
                  <div className="text-[12px] text-neutral-400">{truncateMiddle(w.address)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleWallet(w.id)}
                    className={`h-7 w-12 rounded-full ${w.enabled ? 'bg-[#F6B74A]' : 'bg-[#3F3F46]'} relative`}
                    aria-pressed={w.enabled}
                    aria-label={translate('popup.approvals.toggle_wallet', { label: w.label })}
                  >
                    <span
                      className="absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full transition-transform shadow bg-white"
                      style={{ transform: w.enabled ? 'translateX(20px)' : 'translateX(0px)' }}
                    />
                  </button>
                  <GhostButton disabled>{translate('common.edit')}</GhostButton>
                  <button
                    onClick={() => removeWallet(w.id)}
                    className="h-8 px-3 rounded-[10px] text-[12px] font-semibold border border-[#3B0B0B] text-red-300 bg-[#170909]"
                  >
                    {translate('common.remove')}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 border border-[#2A2A2A] rounded-[12px] p-3 bg-[#0E0E0E]">
          <div className="text-[14px] font-semibold">{translate('popup.approvals.add_wallet_cta')}</div>
          <div className="mt-2 grid gap-2">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={translate('popup.approvals.label_placeholder')}
              className="h-9 rounded-[10px] bg-[#090909] border border-[#2A2A2A] px-3 text-[13px] outline-none"
            />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={translate('popup.approvals.address_placeholder')}
              className="h-9 rounded-[10px] bg-[#090909] border border-[#2A2A2A] px-3 text-[13px] outline-none"
            />
            <div className="flex justify-end mt-1">
              <button
                onClick={addWallet}
                className="h-8 px-3 rounded-[10px] text-[12px] font-semibold border border-[#1E1E1E] bg-[#0B0B0B]"
              >
                {translate('common.add')}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-[10px] text-[13px] font-semibold border border-[#1E1E1E] bg-[#0B0B0B]"
          >
            {translate('common.close')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
