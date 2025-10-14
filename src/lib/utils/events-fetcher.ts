import { createViemPublicClientForChain } from '../chains/chains';
import { getTokenEvents } from '../chains/events';
import { getAllowancesFromEvents } from './allowances';
import type { Address } from 'viem';
import type { TokenEvent } from './events';
import type { TokenAllowanceData } from './allowances';

/**
 * Pure function to fetch token events for an address on a specific chain
 * This replaces the useEvents React hook for Chrome extension compatibility
 */
export async function fetchTokenEvents(address: Address, chainId: number): Promise<TokenEvent[]> {
  return getTokenEvents(chainId as any, address);
}

/**
 * Pure function to fetch allowances for an address on a specific chain
 * This replaces the useAllowances React hook for Chrome extension compatibility
 */
export async function fetchAllowances(address: Address, chainId: number): Promise<TokenAllowanceData[]> {
  const publicClient = createViemPublicClientForChain(chainId);
  if (!publicClient) {
    console.warn(`No public client available for chain ${chainId}`);
    return [];
  }

  try {
    const events = await fetchTokenEvents(address, chainId);
    const allowances = await getAllowancesFromEvents(address, events, publicClient, chainId);
    return allowances;
  } catch (error) {
    console.error('Failed to fetch allowances:', error);
    return [];
  }
}

/**
 * Helper function to map TokenAllowanceData to a simple UI format
 */
export function mapAllowancesToUIFormat(allowances: TokenAllowanceData[]) {
  const filtered = allowances.filter((a) => Boolean(a.payload));

  const mapped = filtered.map((a) => {
    const allowanceText =
      a.payload?.type === 'ERC20'
        ? a.metadata?.decimals != null
          ? (Number(a.payload!.amount) / 10 ** (a.metadata.decimals || 0)).toString()
          : a.payload!.amount.toString()
        : a.payload?.type === 'ERC721_SINGLE'
          ? `#${(a.payload as any).tokenId}`
          : 'All';

    return {
      token: a.metadata.symbol || a.contract.address,
      spender: (a.payload as any).spender || '',
      spenderLabel: '', // Could be enriched with whois data later
      allowance: allowanceText,
    };
  });

  console.log('Mapped approvals:', mapped);
  return mapped;
}
