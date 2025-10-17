import React, { useEffect, useState } from 'react';
import { GhostButton } from './controls';
import Modal from './Modal';
import useBrowserStorage from '../../../hooks/useBrowserStorage';
import { fetchAllowances, mapAllowancesToUIFormat } from '../../../lib/utils/events-fetcher';
import { getJsonCookie, setJsonCookie } from '../../../lib/utils/cookies';
import type { Address } from 'viem';

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

function WalletPill({ label, onPrev, onNext }: { label: string; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        aria-label="Previous wallet"
        className="h-7 w-7 rounded-[10px] border border-[#1E1E1E] bg-[#0E0E0E] grid place-items-center"
        onClick={onPrev}
      >
        <span className="text-neutral-300">◀</span>
      </button>
      <div className="px-3 py-1.5 rounded-[10px] bg-[#0E0E0E] border border-[#1E1E1E] text-[12px] font-semibold">
        {label}
      </div>
      <button
        aria-label="Next wallet"
        className="h-7 w-7 rounded-[10px] border border-[#1E1E1E] bg-[#0E0E0E] grid place-items-center"
        onClick={onNext}
      >
        <span className="text-neutral-300">▶</span>
      </button>
    </div>
  );
}

const STORAGE_KEY = 'approvals.watchlist';

function CopyButton({ value, size = 14, className }: { value: string; size?: number; className?: string }) {
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
      aria-label="Copy address"
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
  const [wallets, setWallets] = useBrowserStorage<Wallet[]>('local', STORAGE_KEY, []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [manageOpen, setManageOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [approvalsState, setApprovalsState] = useState<Approval[]>([]);

  const activeWallet = wallets?.[activeIndex];

  // Load approvals for the first enabled wallet when the tab is open
  useEffect(() => {
    const loadApprovals = async () => {
      const enabledWallets = (wallets || []).filter((w) => w.enabled);
      const wallet = enabledWallets[activeIndex] || enabledWallets[0];
      if (!wallet) {
        setApprovalsState([]);
        return;
      }

      try {
        setLoading(true);
        const chainId = 1; // default to Ethereum mainnet for now

        // 1-hour cache in cookies per address+chain
        const cacheKey = `approvals:${chainId}:${wallet.address.toLowerCase()}`;
        const TTL_SECONDS = 60 * 60;

        // Try cache first
        const cached = getJsonCookie<{ data: Approval[]; ts: number }>(cacheKey);
        const now = Date.now();
        if (
          cached &&
          typeof cached.ts === 'number' &&
          now - cached.ts < TTL_SECONDS * 1000 &&
          Array.isArray(cached.data)
        ) {
          setApprovalsState(cached.data);
          setLoading(false);
          return;
        }

        // Fetch fresh if no valid cache
        const allowances = await fetchAllowances(wallet.address as Address, chainId);
        const mappedApprovals = mapAllowancesToUIFormat(allowances);
        setApprovalsState(mappedApprovals);

        // Save to cookie cache (1 hour)
        setJsonCookie(cacheKey, { data: mappedApprovals, ts: now }, TTL_SECONDS);
      } catch (error) {
        console.error('Failed to load approvals:', error);
        setApprovalsState([]);
      } finally {
        setLoading(false);
      }
    };

    loadApprovals();
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
        <div className="text-[12px] font-semibold tracking-wide uppercase text-neutral-400">Approvals</div>
        <button
          onClick={() => setManageOpen(true)}
          className="h-8 px-3 rounded-[10px] text-[12px] font-semibold border border-[#1E1E1E] bg-[#0B0B0B]"
        >
          Manage Wallets
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
                <CopyButton value={activeWallet?.address || ''} size={12} />
              </div>
            </div>
            <div className="text-[12px] text-neutral-400">
              {loading ? 'Loading…' : `${approvalsState.length} open approvals`}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <WalletPill label={activeWallet?.label ?? ''} onPrev={onPrev} onNext={onNext} />
              <div className="text-[12px] text-neutral-400">
                Wallet {activeIndex + 1} of {wallets.length}
              </div>
            </div>

            <div className="mt-3 rounded-[12px] border border-[#1E1E1E] overflow-hidden">
              <div className="grid grid-cols-[1fr,1fr,1fr] px-3 py-2 text-[11px] uppercase text-neutral-400">
                <div>Token</div>
                <div>Spender</div>
                <div className="text-right">Allowance</div>
              </div>
              <div className="h-[1px] bg-[#1A1A1A]" />
              {approvalsState.length === 0 ? (
                <div className="px-3 py-6 text-[13px] text-neutral-400">No approvals found for this wallet yet.</div>
              ) : (
                <div className="max-h-[360px] overflow-auto">
                  <ul>
                    {approvalsState.map((a, idx) => (
                      <li key={idx} className="px-3 py-3 grid grid-cols-[1fr,1fr,1fr] items-center text-[13px]">
                        <div className="font-medium">{a.token}</div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="truncate">{a.spender}</span>
                            <CopyButton value={a.spender} />
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
            No wallets yet. Add a wallet to start tracking approvals.
            <div className="mt-2">
              <button
                onClick={() => setManageOpen(true)}
                className="h-8 px-3 rounded-[10px] text-[12px] font-semibold border border-[#1E1E1E] bg-[#111111]"
              >
                Add wallet
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
      />
    </div>
  );
}

function WalletsModal({
  open,
  onClose,
  wallets,
  onChangeWallets,
}: {
  open: boolean;
  onClose: () => void;
  wallets: Wallet[];
  onChangeWallets: (ws: Wallet[]) => void;
}) {
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');

  function addWallet() {
    const addr = address.trim();
    if (!addr) return;
    const id = Math.random().toString(36).slice(2);
    onChangeWallets([...(wallets || []), { id, label: label || 'Wallet', address: addr, enabled: true }]);
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
        <div className="text-[18px] font-bold leading-tight">Watchlist {wallets.length}/5</div>
        <div className="text-[12px] text-neutral-400 mt-1">We only watch addresses. No seed phrases. No signing.</div>
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
                  >
                    <span
                      className="absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full transition-transform shadow bg-white"
                      style={{ transform: w.enabled ? 'translateX(20px)' : 'translateX(0px)' }}
                    />
                  </button>
                  <GhostButton disabled>Edit</GhostButton>
                  <button
                    onClick={() => removeWallet(w.id)}
                    className="h-8 px-3 rounded-[10px] text-[12px] font-semibold border border-[#3B0B0B] text-red-300 bg-[#170909]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 border border-[#2A2A2A] rounded-[12px] p-3 bg-[#0E0E0E]">
          <div className="text-[14px] font-semibold">Add wallet</div>
          <div className="mt-2 grid gap-2">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Name of Wallet. Ex: Main Vault"
              className="h-9 rounded-[10px] bg-[#090909] border border-[#2A2A2A] px-3 text-[13px] outline-none"
            />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="revoke.eth or 0x..."
              className="h-9 rounded-[10px] bg-[#090909] border border-[#2A2A2A] px-3 text-[13px] outline-none"
            />
            <div className="flex justify-end mt-1">
              <button
                onClick={addWallet}
                className="h-8 px-3 rounded-[10px] text-[12px] font-semibold border border-[#1E1E1E] bg-[#0B0B0B]"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-[10px] text-[13px] font-semibold border border-[#1E1E1E] bg-[#0B0B0B]"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
