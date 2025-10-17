import { createViemPublicClientForChain } from '../chains/chains';
import { getTokenEvents } from '../chains/events';
import { getAllowancesFromEvents, formatErc20Allowance, isErc20Allowance, AllowanceType } from './allowances';
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
    let allowanceText: string;

    if (a.payload && isErc20Allowance(a.payload)) {
      // Use shared formatter which returns 'Unlimited' when allowance exceeds totalSupply
      allowanceText = formatErc20Allowance(a.payload.amount, a.metadata.decimals, a.metadata.totalSupply);
    } else if (a.payload?.type === AllowanceType.ERC721_SINGLE) {
      allowanceText = `#${(a.payload as any).tokenId}`;
    } else {
      // Covers ERC721 all-collection approvals
      allowanceText = 'All';
    }

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
