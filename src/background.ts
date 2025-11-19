import { getAddress, Hash, hexToBigInt, isAddress, isHex } from 'viem';
import Browser from 'webextension-polyfill';
import {
  AddressAllowList,
  CHAINPATROL_API_KEY,
  ENABLE_LOG_SIMULATIONS,
  FEATURE_KEYS,
  HostnameAllowList,
  SIMULATOR_VISITED_DAPPS,
  WarningType,
  warningSettingKeys,
} from './lib/constants';
import { checkAsset, toCaip2 } from './lib/chainpatrol/chainpatrol';
import { AggregateDecoder } from './lib/decoders/AggregateDecoder';
import { ApproveDecoder } from './lib/decoders/transaction/ApproveDecoder';
import { IncreaseAllowanceDecoder } from './lib/decoders/transaction/IncreaseAllowanceDecoder';
import { IncreaseApprovalDecoder } from './lib/decoders/transaction/IncreaseApprovalDecoder';
import { Permit2ApproveDecoder } from './lib/decoders/transaction/Permit2ApproveDecoder';
import { SetApprovalForAllDecoder } from './lib/decoders/transaction/SetApprovalForAllDecoder';
import { SuspectedScamDecoder } from './lib/decoders/transaction/SuspectedScamDecoder';
import { Permit2BatchDecoder } from './lib/decoders/typed-signature/Permit2BatchDecoder';
import { Permit2SingleDecoder } from './lib/decoders/typed-signature/Permit2SingleDecoder';
import { PermitDecoder } from './lib/decoders/typed-signature/PermitDecoder';
import { PermitForAllDecoder } from './lib/decoders/typed-signature/PermitForAllDecoder';
import { BlurBulkDecoder } from './lib/decoders/typed-signature/listing/BlurBulkDecoder';
import { BlurDecorder } from './lib/decoders/typed-signature/listing/BlurDecoder';
import { LooksRareDecoder } from './lib/decoders/typed-signature/listing/LooksRareDecoder';
import { Seaport14Decoder } from './lib/decoders/typed-signature/listing/Seaport14Decoder';
import { Seaport1Decoder } from './lib/decoders/typed-signature/listing/Seaport1Decoder';
import { BiconomyNativeDecoder } from './lib/decoders/typed-signature/metatransactions/BiconomyNativeDecoder';
import { GsnRelayDecoder } from './lib/decoders/typed-signature/metatransactions/GsnRelayDecoder';
import { HashDecoder } from './lib/decoders/untyped-signature/HashDecoder';
import { Message, MessageResponse, WarningData } from './lib/types';
import { normaliseMessage } from './lib/utils/messages';
import { getStorage } from './lib/utils/storage';
import { track } from './lib/utils/analytics';
import { getTenderlyConfig } from './tenderly/config';
import {
  initLoggingAlarms,
  logAddressPoisoning,
  logPopupNOK,
  logPopupOK,
  logSimulation,
  logSwapFeeTaken,
} from './logs/extensionLogs';

const inflightRequests = new Set<Hash>();
const openPopupByKey = new Map<string, number>();

const windowIdByRequestId = new Map<Hash, number>();

function isMessageResponse(x: any): x is MessageResponse {
  return x && typeof x.requestId === 'string' && (x.data === true || x.data === false);
}

type TxLike = { from?: string; to?: string | null; value?: any; nonce?: any; data?: string };
const recentTxKeys = new Map<string, number>();
const DEDUPE_MS = 5_000;
const DEDUPE_MS_SLOWMODE = 12_000;
function numLikeString(v: any) {
  const n = numLike(v);
  return n == null ? '' : String(n);
}

function txKey(chainId: number, tx: TxLike) {
  const from = (tx.from || '').toLowerCase();
  const to = (tx.to || '').toLowerCase();
  const value = numLikeString(tx.value) || '0';
  // Don't include nonce in key - dapps often increment it on retry
  const sel = (tx.data || '0x').slice(0, 10); // 4-byte selector
  return `${chainId}:${from}:${to}:${value}:${sel}`;
}

async function shouldDedupe(chainId: number, tx: TxLike) {
  const key = txKey(chainId, tx);
  const now = Date.now();
  for (const [k, until] of recentTxKeys) if (until <= now) recentTxKeys.delete(k);
  const exists = recentTxKeys.has(key);

  // Use longer dedupe time if slowmode is enabled
  const slowMode = await getStorage('local', FEATURE_KEYS.SLOWMODE, false);
  const dedupeTime = slowMode ? DEDUPE_MS_SLOWMODE : DEDUPE_MS;

  recentTxKeys.set(key, now + dedupeTime);
  return exists;
}

// Note that these messages will be periodically cleared due to the background service shutting down
// after 5 minutes of inactivity (see Manifest v3 docs).
const messagePorts: Record<string, Browser.Runtime.Port> = {};
const approvedMessages: Array<Hash> = [];

const transactionDecoders = [
  new ApproveDecoder(),
  new IncreaseAllowanceDecoder(),
  new IncreaseApprovalDecoder(),
  new SetApprovalForAllDecoder(),
  new SuspectedScamDecoder(),
  new Permit2ApproveDecoder(),
];
const typedSignatureDecoders = [
  new PermitDecoder(),
  new PermitForAllDecoder(),
  new Permit2SingleDecoder(),
  new Permit2BatchDecoder(),
  new Seaport1Decoder(),
  new Seaport14Decoder(),
  new LooksRareDecoder(),
  new BlurDecorder(),
  new BlurBulkDecoder(),
  new GsnRelayDecoder(new AggregateDecoder(transactionDecoders, [], [])),
  new BiconomyNativeDecoder(new AggregateDecoder(transactionDecoders, [], [])),
];
const untypedSignatureDecoders = [new HashDecoder()];

const messageDecoder = new AggregateDecoder(transactionDecoders, typedSignatureDecoders, untypedSignatureDecoders);

const setupRemoteConnection = async (remotePort: Browser.Runtime.Port) => {
  remotePort.onMessage.addListener((message: Message) => {
    processMessage(normaliseMessage(message), remotePort);
  });
};

Browser.runtime.onInstalled.addListener(() => initLoggingAlarms());
Browser.runtime.onStartup.addListener(() => initLoggingAlarms());

Browser.runtime.onConnect.addListener(setupRemoteConnection);

// Store hostname by requestId for marking as visited after confirmation
const hostnameByRequestId = new Map<Hash, string>();

Browser.runtime.onMessage.addListener((maybeResponse: unknown) => {
  if (!isMessageResponse(maybeResponse)) {
    return;
  }
  const response = maybeResponse as MessageResponse;

  const responsePort = messagePorts[response.requestId];
  track('Responded to request', { requestId: response.requestId, response: response.data });

  if (response.data) {
    approvedMessages.push(response.requestId);

    // Mark dapp as visited when user confirms
    const hostname = hostnameByRequestId.get(response.requestId);
    if (hostname) {
      markDappAsVisitedBG(hostname).catch(() => {});
    }
  }

  // Clean up hostname map regardless of confirmation or rejection
  hostnameByRequestId.delete(response.requestId);

  try {
    const uaGuess = undefined as any;

    const meta = {
      url: undefined as string | undefined,
      simulationSummary: undefined as any,
    };

    const log = response.data ? logPopupOK : logPopupNOK;
    if (uaGuess) log(uaGuess, meta).catch(() => {});
  } catch {}

  if (responsePort) {
    responsePort.postMessage(response);
    delete messagePorts[response.requestId];
  }

  inflightRequests.delete(response.requestId);

  const winId = windowIdByRequestId.get(response.requestId);
  if (winId != null) {
    windowIdByRequestId.delete(response.requestId);
    // Small delay to ensure message is fully processed before closing window
    setTimeout(() => {
      try {
        Browser.windows.remove(winId);
      } catch {}
    }, 250);
  }
});

Browser.runtime.onMessage.addListener((msg: any) => {
  if (msg?.__fs_event__ === true && msg.kind === 'addressPoisoning') {
    const { metadata } = msg as {
      userAddress?: `0x${string}` | null;
      metadata: { url?: string; flaggedAddress: `0x${string}` };
    };

    logAddressPoisoning('0x0', metadata).catch(() => {});
  }
});

Browser.runtime.onMessage.addListener((msg: any) => {
  console.log('TEST', msg);
  if (msg?.__fs_event__ === true && msg.kind === 'swapFeeTaken') {
    const { userAddress, metadata } = msg as {
      userAddress: `0x${string}`;
      metadata: {
        chainId: number;
        txHash?: string | null;
        inputs?: Array<{ token: string; amount: string }>;
        outputs?: Array<{ token: string; amount: string }>;
        feeTaken?: { token: string; amount: string };
        url?: string;
        note?: string;
      };
    };
    if (!userAddress) return;
    logSwapFeeTaken(userAddress, metadata).catch(() => {});
  }
});

Browser.runtime.onMessage.addListener((msg: any) => {
  if (msg && msg.__fs_event__ === true) {
    const { kind, userAddress, metadata } = msg as {
      kind: 'popupOK' | 'popupNOK';
      userAddress?: `0x${string}`;
      metadata?: any;
    };
    if (!kind || !userAddress) return;

    const fn = kind === 'popupOK' ? logPopupOK : logPopupNOK;
    fn(userAddress, metadata ?? {}).catch(() => {});
  }
});

Browser.windows.onRemoved.addListener((id) => {
  for (const [k, winId] of openPopupByKey) {
    if (winId === id) openPopupByKey.delete(k);
  }
});

async function isSimulatorEnabledBG(): Promise<boolean | undefined> {
  return getStorage('local', FEATURE_KEYS.SIMULATOR, true);
}

async function shouldShowEveryTransactionBG(): Promise<boolean | undefined> {
  return getStorage('local', FEATURE_KEYS.SIMULATOR_SHOW_EVERY_TX, false);
}

async function shouldShowOnlyOnWarningsBG(): Promise<boolean | undefined> {
  return getStorage('local', FEATURE_KEYS.SIMULATOR_WARNINGS_ONLY, false);
}

async function hasVisitedDappBG(hostname: string): Promise<boolean> {
  try {
    const result = await Browser.storage.local.get(SIMULATOR_VISITED_DAPPS);
    const visitedDapps = (result[SIMULATOR_VISITED_DAPPS] || {}) as Record<string, boolean>;
    return !!visitedDapps[hostname];
  } catch {
    return false;
  }
}

async function markDappAsVisitedBG(hostname: string): Promise<void> {
  try {
    const result = await Browser.storage.local.get(SIMULATOR_VISITED_DAPPS);
    const visitedDapps = (result[SIMULATOR_VISITED_DAPPS] || {}) as Record<string, boolean>;
    visitedDapps[hostname] = true;
    await Browser.storage.local.set({ [SIMULATOR_VISITED_DAPPS]: visitedDapps });
  } catch {}
}

async function hasMaliciousOrWarningInSummary(tenderlySummary: any, chainId?: number): Promise<boolean> {
  if (!tenderlySummary) return false;

  // Check if transaction failed
  if (tenderlySummary?.transaction?.status === false) return true;

  // Check for malicious assets using ChainPatrol
  if (CHAINPATROL_API_KEY && chainId) {
    const assetChanges = tenderlySummary?.transaction?.transaction_info?.asset_changes || [];
    const userAddress = tenderlySummary?.transaction?.from?.toLowerCase();

    for (const change of assetChanges) {
      // Check tokens being received (incoming transfers to user)
      const isReceiving = change?.to?.toLowerCase() === userAddress;
      const tokenAddress = change?.token_info?.contract_address;

      if (isReceiving && tokenAddress) {
        try {
          const caip = toCaip2(chainId, tokenAddress);
          if (caip) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

            const result = await checkAsset(caip, CHAINPATROL_API_KEY, controller.signal);
            clearTimeout(timeoutId);

            const status = result?.status?.toUpperCase() || '';
            if (status === 'BLOCKED') {
              return true; // Malicious token detected!
            }
          }
        } catch (error) {
          // If ChainPatrol check fails/times out, continue without blocking
        }
      }
    }
  }

  return false;
}

const numLike = (v: any): number | string | undefined => {
  if (v == null) return undefined;
  if (typeof v === 'bigint') {
    const s = v.toString();
    const n = Number(s);
    return Number.isSafeInteger(n) ? n : s;
  }
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    if (isHex(v)) {
      const s = hexToBigInt(v as `0x${string}`).toString();
      const n = Number(s);
      return Number.isSafeInteger(n) ? n : s;
    }
    if (/^\d+$/.test(v)) {
      const n = Number(v);
      return Number.isSafeInteger(n) ? n : v;
    }
    try {
      const s = BigInt(v).toString();
      const n = Number(s);
      return Number.isSafeInteger(n) ? n : s;
    } catch {
      return undefined;
    }
  }
  try {
    const s = BigInt(v).toString();
    const n = Number(s);
    return Number.isSafeInteger(n) ? n : s;
  } catch {
    return undefined;
  }
};

export async function simulateWithTenderly(chainId: number, tx: any) {
  const cfg = await getTenderlyConfig();
  if (!cfg?.enabled || !cfg.account || !cfg.project || !cfg.accessKey) return null; // non-blocking

  if (!isAddress(tx?.from)) return { ok: false, error: 'Invalid from address' };
  const from = getAddress(tx.from);
  const to = tx?.to ? (isAddress(tx.to) ? getAddress(tx.to) : null) : null;

  const payload: any = {
    network_id: String(chainId),
    from,
    to,
    gas: numLike(tx?.gas),
    gas_price: numLike(tx?.gasPrice),
    max_fee_per_gas: numLike(tx?.maxFeePerGas),
    max_priority_fee_per_gas: numLike(tx?.maxPriorityFeePerGas),
    nonce: numLike(tx?.nonce),
    value: numLike(tx?.value) ?? 0,
    input: tx?.data ?? '0x',
    simulation_type: 'quick',
    save_if_fails: true,
    save: true,
  };
  if (payload.max_fee_per_gas != null || payload.max_priority_fee_per_gas != null) {
    delete payload.gas_price;
  }

  const url = `https://api.tenderly.co/api/v1/account/${encodeURIComponent(cfg.account!)}/project/${encodeURIComponent(cfg.project!)}/simulate`;
  const headers = { 'Content-Type': 'application/json', 'X-Access-Key': cfg.accessKey! };

  try {
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json?.error || json?.message || res.statusText };

    return json;
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Simulation failed' };
  }
}

const processMessage = async (message: Message, remotePort: Browser.Runtime.Port) => {
  if (inflightRequests.has(message.requestId)) {
    return;
  }
  inflightRequests.add(message.requestId);
  if (message.data.type === 'typed-signature') {
    try {
      remotePort.postMessage({ requestId: message.requestId, data: true });
      return;
    } finally {
    }
  }

  try {
    const popupCreated = await decodeMessageAndCreatePopupIfNeeded(message);
    if (message.data.bypassed) return;

    if (!popupCreated) {
      remotePort.postMessage({ requestId: message.requestId, data: true });
      return;
    }
    messagePorts[message.requestId] = remotePort;
  } finally {
  }
};

// Boolean result indicates whether a popup was created
const decodeMessageAndCreatePopupIfNeeded = async (message: Message): Promise<boolean> => {
  if (approvedMessages.includes(message.requestId)) return false;

  trackMessage(message);

  const warningData = messageDecoder.decode(message);
  const mdata = message.data as any;

  let tenderlySummary: any = null;

  if (mdata?.transaction && typeof mdata?.chainId === 'number') {
    if (await shouldDedupe(mdata.chainId, mdata.transaction)) return false;

    const simulatorOn = await isSimulatorEnabledBG();
    if (simulatorOn) {
      tenderlySummary = await simulateWithTenderly(mdata.chainId, mdata.transaction);
    }
    const ua = mdata.transaction.from as `0x${string}` | undefined;
    if (ua && ENABLE_LOG_SIMULATIONS) {
      const selector = (mdata.transaction.data || '0x').slice(0, 10);
      const simMeta = {
        url: warningData?.hostname ? `https://${warningData.hostname}` : undefined,
        txPreview: {
          chainId: mdata.chainId,
          from: ua,
          to: (mdata.transaction.to || null) as any,
          selector,
          value: mdata.transaction.value ?? 0,
          data: mdata.transaction.data,
          txHash: mdata.transaction.txHash,
        },
        ok: !!(tenderlySummary && (tenderlySummary.transaction || tenderlySummary.ok)),
        error: (tenderlySummary && (tenderlySummary as any).error) || undefined,
        tenderlyId: (tenderlySummary as any)?.simulation?.id || (tenderlySummary as any)?.id,
        tenderlyUrl: (tenderlySummary as any)?.simulation?.url || (tenderlySummary as any)?.url,
        // tras: tenderlySummary,
        balanceChanges: tenderlySummary.transaction.transaction_info.balance_changes,
        note: 'Metamask confirmation pending',
        transactionId: tenderlySummary.transaction.transaction_info.transaction_id,
      };
      logSimulation(ua, simMeta).catch(() => {});
    }
  }

  if (!warningData && !tenderlySummary) return false;

  if (warningData) {
    const warningsTurnedOnForType = await getStorage('local', warningSettingKeys[warningData.type], true);
    if (!warningsTurnedOnForType) return false;

    const isHostnameAllowListed = HostnameAllowList[warningData.type].includes(warningData.hostname);
    if (isHostnameAllowListed) return false;
    const address =
      'spender' in warningData ? warningData.spender : 'address' in warningData ? warningData.address : '';
    const isAddressAllowListed = AddressAllowList[warningData.type].includes(address.toLowerCase());
    if (isAddressAllowListed) return false;
  }

  // Extract hostname for tracking visits
  const hostname = warningData?.hostname || (mdata as any)?.hostname || '';
  // Check simulator mode for tenderly popups (when there's no warningData)
  if (!warningData && tenderlySummary) {
    const [showEveryTx, warningsOnly] = await Promise.all([
      shouldShowEveryTransactionBG(),
      shouldShowOnlyOnWarningsBG(),
    ]);

    if (showEveryTx) {
      // Always show
    } else if (warningsOnly) {
      // Only show if there are warnings
      const hasWarnings = await hasMaliciousOrWarningInSummary(tenderlySummary, mdata?.chainId);
      if (!hasWarnings) return false;
    } else {
      // First time + on warnings
      if (hostname) {
        const hasVisited = await hasVisitedDappBG(hostname);
        const hasWarnings = await hasMaliciousOrWarningInSummary(tenderlySummary, mdata?.chainId);
        if (hasVisited && !hasWarnings) return false;
      }
    }
  }

  // Store hostname for marking as visited after confirmation
  if (hostname && tenderlySummary) {
    hostnameByRequestId.set(message.requestId, hostname);
  }

  const key =
    mdata?.transaction && typeof mdata?.chainId === 'number' ? txKey(mdata.chainId, mdata.transaction) : undefined;

  await createWarningPopup(message.requestId, warningData, tenderlySummary ?? null, key);
  if (warningData) trackWarning(warningData);

  return true;
};

const trackWarning = (warningData: WarningData) => {
  if (warningData.type === WarningType.ALLOWANCE) {
    const { requestId, chainId, hostname, bypassed, spender } = warningData;
    const allowance = { spender };
    track('Allowance requested', { requestId, chainId, hostname, bypassed, allowance });
  } else if (warningData.type === WarningType.LISTING) {
    const { requestId, chainId, hostname, bypassed, platform } = warningData;
    track('NFT listing requested', { requestId, chainId, hostname, bypassed, platform });
  } else if (warningData.type === WarningType.SUSPECTED_SCAM) {
    const { requestId, chainId, hostname, bypassed, address } = warningData;
    track('Suspected scam detected', { requestId, chainId, hostname, bypassed, address });
  } else if (warningData.type === WarningType.HASH) {
    const { requestId, hostname, bypassed } = warningData;
    track('Hash signature requested', { requestId, hostname, bypassed });
  }
};

const trackMessage = (message: Message) => {
  track('Message received', { message });
};

const calculatePopupPositions = (
  window: Browser.Windows.Window,
  warningData?: WarningData,
  slowMode: boolean = false,
) => {
  const width = warningData && slowMode ? 750 : slowMode ? 570 : 400;
  const height = calculatePopupHeight(warningData) + (slowMode ? 250 : 70);
  const left = window.left! + Math.round((window.width! - width) * 0.5);
  const top = window.top! + Math.round((window.height! - height) * 0.2);
  return { width, height, left, top };
};

const calculatePopupHeight = (warningData?: WarningData) => {
  // This is an estimate of the height of the frame around the popup, unfortunately we can't get the actual value (which is OS / browser dependent)
  const FRAME_HEIGHT = 28;

  const BORDER_HEIGHT = 1;
  const MARGIN_HEIGHT = 12;

  const HEADER_HEIGHT = 64;
  const HOSTNAME_HEIGHT = 92; // Includes the Kerberus domain check
  const TITLE_HEIGHT = 44;

  const LINE_HEIGHT = 44;
  const DATA_SEPARATOR_HEIGHT = 28;

  const FOOTER_HEIGHT = 64;
  const WARNING_HEIGHT = 64;

  const baseHeight =
    FRAME_HEIGHT +
    HEADER_HEIGHT +
    BORDER_HEIGHT +
    HOSTNAME_HEIGHT +
    BORDER_HEIGHT +
    TITLE_HEIGHT +
    0 +
    MARGIN_HEIGHT +
    BORDER_HEIGHT +
    FOOTER_HEIGHT;
  const bypassHeight = warningData?.bypassed ? WARNING_HEIGHT + MARGIN_HEIGHT : 0;

  if (warningData?.type === WarningType.ALLOWANCE) {
    const spenderHeight = LINE_HEIGHT;
    const assetsHeight = LINE_HEIGHT * warningData.assets.length + BORDER_HEIGHT * (warningData.assets.length - 1);
    const contentHeight = spenderHeight + DATA_SEPARATOR_HEIGHT + assetsHeight;
    return baseHeight + bypassHeight + contentHeight;
  } else if (warningData?.type === WarningType.LISTING) {
    const offerHeight =
      LINE_HEIGHT * warningData.listing.offer.length + BORDER_HEIGHT * (warningData.listing.offer.length - 1);
    const considerationHeight =
      LINE_HEIGHT * warningData.listing.consideration.length +
      BORDER_HEIGHT * (warningData.listing.consideration.length - 1);
    const contentHeight = offerHeight + DATA_SEPARATOR_HEIGHT + considerationHeight;
    return baseHeight + bypassHeight + contentHeight;
  } else if (warningData?.type === WarningType.SUSPECTED_SCAM) {
    return baseHeight + bypassHeight + LINE_HEIGHT;
  } else if (warningData?.type === WarningType.HASH) {
    return baseHeight + bypassHeight + LINE_HEIGHT + WARNING_HEIGHT + MARGIN_HEIGHT;
  }

  // Should not be reachable
  return baseHeight + bypassHeight + 2 * LINE_HEIGHT;
};
const createWarningPopup = async (
  requestId: Hash,
  warningData?: WarningData,
  tenderlySummary?: any | null,
  popupKey?: string,
) => {
  try {
    const existingWinId = windowIdByRequestId.get(requestId);
    if (existingWinId != null) {
      try {
        await Browser.windows.update(existingWinId, { focused: true, drawAttention: true });
        return;
      } catch {
        windowIdByRequestId.delete(requestId);
      }
    }

    if (popupKey && openPopupByKey.has(popupKey)) {
      const winId = openPopupByKey.get(popupKey)!;
      try {
        await Browser.windows.update(winId, { focused: true, drawAttention: true });
        windowIdByRequestId.set(requestId, winId);
        return;
      } catch {
        openPopupByKey.delete(popupKey);
      }
    }

    const delayPromise = new Promise((resolve) => setTimeout(resolve, 200));
    const [currentWindow, storageResult] = await Promise.all([
      Browser.windows.getCurrent(),
      Browser.storage.local.get(FEATURE_KEYS.SLOWMODE),
      delayPromise,
    ]);
    const slowMode = storageResult[FEATURE_KEYS.SLOWMODE] ?? false;
    const positions = calculatePopupPositions(currentWindow, warningData, slowMode);

    const qs = new URLSearchParams({
      requestId,
      ...(warningData ? { warningData: JSON.stringify(warningData) } : {}),
      ...(tenderlySummary ? { tenderlySummary: JSON.stringify(tenderlySummary) } : {}),
    }).toString();

    const url = chrome.runtime.getURL(`confirm.html?${qs}`);

    const popupWindow = await Browser.windows.create({
      url,
      type: 'popup',
      focused: true,
      ...positions,
    });

    if (popupKey && popupWindow?.id != null) openPopupByKey.set(popupKey, popupWindow.id);
    if (popupWindow?.id != null) windowIdByRequestId.set(requestId, popupWindow.id);
  } catch (e) {
    console.error('[bg] popup error', e);
  }
};

const ONBOARDING_PATH = 'onboarding/index.html';
const ONBOARDING_URL = chrome.runtime.getURL(ONBOARDING_PATH);

const OB_KEYS = {
  hasOnboarded: 'ob_hasOnboarded',
  dismissed: 'ob_dismissed',
  lastVersion: 'ob_lastVersion',
} as const;

const parseVer = (v?: string) => (v ?? '0.0.0').split('.').map((n) => parseInt(n || '0', 10));
const isMajorBump = (prev?: string, curr?: string) => parseVer(curr)[0] > parseVer(prev)[0];

async function openOnboardingTab(active = true, extraQS?: Record<string, string>) {
  const url = extraQS ? `${ONBOARDING_URL}?${new URLSearchParams(extraQS).toString()}` : ONBOARDING_URL;

  await Browser.tabs.create({ url, active });
}

Browser.runtime.onInstalled.addListener(async ({ reason, previousVersion }) => {
  const thisVersion = chrome.runtime.getManifest().version;

  const [hasOnboarded, dismissed] = await Promise.all([
    getStorage('local', OB_KEYS.hasOnboarded, false),
    getStorage('local', OB_KEYS.dismissed, false),
  ]);

  if (reason === 'install') {
    await Browser.storage.local.set({
      [OB_KEYS.hasOnboarded]: false,
      [OB_KEYS.dismissed]: false,
      [OB_KEYS.lastVersion]: thisVersion,
    });
    await openOnboardingTab(true, { v: thisVersion, reason: 'install' });
    return;
  }

  if (reason === 'update') {
    const show = isMajorBump(previousVersion, thisVersion) && !dismissed;

    await Browser.storage.local.set({ [OB_KEYS.lastVersion]: thisVersion });

    if (show) {
      await openOnboardingTab(false, { v: thisVersion, reason: 'major-update' });
    }
  }
});

Browser.action.onClicked.addListener(async () => {
  await openOnboardingTab(true, { reason: 'manual' });
});
