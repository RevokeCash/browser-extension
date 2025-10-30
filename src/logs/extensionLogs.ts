import Browser from 'webextension-polyfill';

// ---- DEBUG SWITCH ----
const DEBUG = true; // flip to false to silence logs in production

function dlog(...args: any[]) {
  if (DEBUG) console.debug('[logs]', ...args);
}
function dwarn(...args: any[]) {
  if (DEBUG) console.warn('[logs]', ...args);
}
function derr(...args: any[]) {
  if (DEBUG) console.error('[logs]', ...args);
}

export type EventType =
  | 'popupOK'
  | 'popupNOK'
  | 'check'
  | 'simulation'
  | 'addressPoisoning'
  | 'swapFeeTaken'
  | 'configChange';

type Address = `0x${string}`;

export type BaseMetadata = {
  timestamp?: number;
  url?: string;
};

export type PopupSummary = BaseMetadata & {
  simulationSummary?: {
    estimatedGas?: number | string;
    changes?: Array<{ token: string; delta: string }>;
    risks?: string[];
  };
  reason?: string;
};

export type SimulationMeta = BaseMetadata & {
  note?: string;
  txPreview?: {
    chainId?: number;
    from?: Address;
    to?: Address | null;
    selector?: string;
    value?: string | number;
  };
  tenderlyId?: string;
  tenderlyUrl?: string;
  ok?: boolean;
  error?: string;
};

export type AddressPoisoningMeta = BaseMetadata & {
  flaggedAddress: Address;
};

export type SwapFeeTakenMeta = BaseMetadata & {
  txHash?: string | null;
  chainId?: number;
  inputs?: Array<{ token: string; amount: string }>;
  outputs?: Array<{ token: string; amount: string }>;
  feeTaken?: { token: string; amount: string };
  note?: string;
};

export type ConfigChangeMeta = BaseMetadata & {
  configKey: string;
  previousValue: boolean | string | number | null;
  newValue: boolean | string | number;
};

const USE_MAINNET = false; // flip on release
const POST_URL = USE_MAINNET
  ? 'https://api.fairside.io/v1/extension-logs/create'
  : 'https://api.test.fairside.dev/v1/extension-logs/create';

const DEVICE_ID_KEY = 'fs_device_id';
const QUEUE_KEY = 'fs_event_queue';
const BACKOFF_KEY = 'fs_backoff_state';
const FLUSH_ALARM = 'fs_flush_alarm';
const MAX_RETRY = 5;

// --- device id ---
async function uuid(): Promise<string> {
  const a = crypto.getRandomValues(new Uint8Array(16));
  a[6] = (a[6] & 0x0f) | 0x40;
  a[8] = (a[8] & 0x3f) | 0x80;
  const b = [...a].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${b.slice(0, 8)}-${b.slice(8, 12)}-${b.slice(12, 16)}-${b.slice(16, 20)}-${b.slice(20)}`;
}

async function getDeviceId(): Promise<string> {
  const stored = (await Browser.storage.local.get(DEVICE_ID_KEY))[DEVICE_ID_KEY];
  if (stored) return stored as string;
  const id = await uuid();
  await Browser.storage.local.set({ [DEVICE_ID_KEY]: id });
  dlog('generated deviceId', id);
  return id;
}

async function getQueue(): Promise<any[]> {
  const raw = (await Browser.storage.local.get(QUEUE_KEY))[QUEUE_KEY];
  return Array.isArray(raw) ? raw : [];
}
async function setQueue(q: any[]) {
  await Browser.storage.local.set({ [QUEUE_KEY]: q });
}
async function getBackoff(): Promise<{ retry: number; next: number }> {
  const raw = (await Browser.storage.local.get(BACKOFF_KEY))[BACKOFF_KEY];
  return (raw as any) || { retry: 0, next: 0 };
}
async function setBackoff(state: { retry: number; next: number }) {
  await Browser.storage.local.set({ [BACKOFF_KEY]: state });
  dlog('backoff set', state);
}

function nowSec() {
  return Math.floor(Date.now() / 1000);
}

export type LogEventArgs<TMeta extends object = Record<string, unknown>> = {
  userAddress: Address;
  eventType: EventType;
  metadata: TMeta & BaseMetadata;
};

// enqueue + kick flush
export async function logEvent<TMeta extends object = Record<string, unknown>>(args: LogEventArgs<TMeta>) {
  const deviceId = await getDeviceId();
  const payload = {
    deviceId,
    userAddress: args.userAddress,
    eventType: args.eventType,
    metadata: {
      ...args.metadata,
      timestamp: args.metadata?.timestamp ?? nowSec(),
    },
  };
  const q = await getQueue();
  q.push(payload);
  await setQueue(q);
  dlog('enqueued event', {
    length: q.length,
    eventType: args.eventType,
    userAddress: args.userAddress,
    metadata: args.metadata,
  });
  flush().catch((e) => derr('flush trigger failed', e));
}

// --- POST single event with visible logs
async function postOne(evt: any) {
  const started = performance.now();
  dlog('POST', POST_URL, evt);
  let res: Response | null = null;
  let text = '';
  try {
    res = await fetch(POST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evt),
    });
    text = await res.text().catch(() => '');
    const ms = Math.round(performance.now() - started);
    dlog('RESP', { status: res.status, ms, body: text });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${text}`);
    }
  } catch (err) {
    const ms = Math.round(performance.now() - started);
    derr('POST error', { err, status: res?.status, ms, body: text });
    throw err;
  }
}

// --- schedule backoff with logs
async function scheduleNext(retry: number) {
  const base = Math.min(2 ** retry * 15, 10 * 60); // cap at 10m
  const delay = Math.floor(base * (0.7 + Math.random() * 0.6));
  const when = Date.now() + delay * 1000;
  dlog('scheduleNext', { retry, delaySec: delay, at: new Date(when).toISOString() });
  await setBackoff({ retry, next: Math.floor(when / 1000) });
  await Browser.alarms.create(FLUSH_ALARM, { when });
}

// --- flush with batch logs
export async function flush() {
  const q = await getQueue();
  if (!q.length) {
    dlog('flush: queue empty');
    await setBackoff({ retry: 0, next: 0 });
    return;
  }
  const bk = await getBackoff();
  if (bk.next && nowSec() < bk.next) {
    dlog('flush: deferred by backoff', { next: bk.next, now: nowSec() });
    return;
  }

  dlog('flush: start', { queued: q.length });
  try {
    const batch = q.slice(0, 10);
    dlog('flush: posting batch', { size: batch.length });
    for (const evt of batch) await postOne(evt);
    const rest = q.slice(batch.length);
    await setQueue(rest);
    await setBackoff({ retry: 0, next: 0 });
    dlog('flush: batch ok', { remaining: rest.length });

    if (rest.length) {
      await Browser.alarms.create(FLUSH_ALARM, { delayInMinutes: 1 });
      dlog('flush: scheduled next drain in 1 min');
    } else {
      dlog('flush: drained all');
    }
  } catch (e) {
    const retry = Math.min((await getBackoff()).retry + 1, MAX_RETRY);
    dwarn('flush: error, scheduling backoff', { retry, error: String(e) });
    await scheduleNext(retry);
  }
}

// --- alarm hook with visibility
Browser.alarms.onAlarm.addListener((a) => {
  dlog('alarm fired', a);
  if (a.name === FLUSH_ALARM) flush().catch((e) => derr('flush on alarm failed', e));
});

// convenience wrappers
export const logPopupOK = (userAddress: Address, meta: PopupSummary) =>
  logEvent({ userAddress, eventType: 'popupOK', metadata: meta });

export const logPopupNOK = (userAddress: Address, meta: PopupSummary) =>
  logEvent({ userAddress, eventType: 'popupNOK', metadata: meta });

export const logSimulation = (userAddress: Address, meta: SimulationMeta) =>
  logEvent({ userAddress, eventType: 'simulation', metadata: meta });

export const logAddressPoisoning = (userAddress: Address, meta: AddressPoisoningMeta) =>
  logEvent({ userAddress, eventType: 'addressPoisoning', metadata: meta });

export const logSwapFeeTaken = (userAddress: Address, meta: SwapFeeTakenMeta) =>
  logEvent({ userAddress, eventType: 'swapFeeTaken', metadata: meta });

export const logConfigChange = (userAddress: Address, meta: ConfigChangeMeta) =>
  logEvent({ userAddress, eventType: 'configChange', metadata: meta });

export const logCheck = <T extends Record<string, unknown> = Record<string, unknown>>(
  userAddress: `0x${string}`,
  metadata: T & BaseMetadata,
) => logEvent({ userAddress, eventType: 'check', metadata });

export function initLoggingAlarms() {
  dlog('initLoggingAlarms: creating periodic alarm (1 min)');
  Browser.alarms.create(FLUSH_ALARM, { periodInMinutes: 1 });
}
