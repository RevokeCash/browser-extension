import type { TxParams, SimulationResult, TenderlyConfig } from './types';

function toDecimalHex(n: number | string) {
  // Accept 0x.. or decimal; return decimal number as string where required by API.
  if (typeof n === 'number') return String(n);
  if (/^0x/i.test(n)) return String(parseInt(n, 16));
  return String(n);
}
const log = (...args: any[]) => console.log('[Revoke][SIMULATE]', ...args);
export async function simulateViaREST(cfg: TenderlyConfig, chainId: number, tx: TxParams): Promise<SimulationResult> {
  console.log('SIMULATE');

  if (!cfg.enabled || !cfg.account || !cfg.project || !cfg.accessKey) {
    return { ok: false, error: 'Tenderly disabled or not configured' };
  }

  const networkId = cfg.network || String(chainId);

  const url = `https://api.tenderly.co/api/v1/account/${encodeURIComponent(cfg.account)}/project/${encodeURIComponent(cfg.project)}/simulate`;

  const payload = {
    network_id: networkId,
    save_if_fails: true,
    save: false,
    simulation_type: 'full',
    transaction: {
      from: tx.from,
      to: tx.to || null,
      input: tx.data || '0x',
      value: tx.value || '0x0',
      gas: tx.gas ? toDecimalHex(tx.gas) : undefined,
      gas_price: tx.gasPrice ? toDecimalHex(tx.gasPrice) : undefined,
      max_fee_per_gas: tx.maxFeePerGas ? toDecimalHex(tx.maxFeePerGas) : undefined,
      max_priority_fee_per_gas: tx.maxPriorityFeePerGas ? toDecimalHex(tx.maxPriorityFeePerGas) : undefined,
      nonce: typeof tx.nonce !== 'undefined' ? toDecimalHex(tx.nonce as any) : undefined,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'X-Access-Key': cfg.accessKey!,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return { ok: false, error: `Tenderly ${res.status}: ${text || res.statusText}` };
  }

  const json = await res.json();

  const sim = json?.simulation || json;
  const urlFromApi = sim?.links?.dashboard || sim?.url || sim?.simulation_url;

  const statusOk = sim?.status === true && !sim?.error_message;
  const gasUsed = sim?.gas_used ? `0x${Number(sim.gas_used).toString(16)}` : undefined;

  return {
    ok: !!statusOk,
    url: urlFromApi,
    error: sim?.error_message,
    gasUsed,
    raw: json,
  };
}
