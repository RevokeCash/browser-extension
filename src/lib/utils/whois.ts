import { type Address, getAddress } from 'viem';
import { WHOIS_BASE_URL } from '../constants';
import type { SpenderData } from '../types';
import { OPENSEA_REGISTRY_ADDRESS } from '../constants';
import { OPENSEA_REGISTRY_ABI } from '../abis';
import { createViemPublicClientForChain } from './chains';
import { ChainId } from '@revoke.cash/chains';
import { ADDRESS_ZERO, ALCHEMY_API_KEY } from '../constants';

const GlobalClients = {
  ETHEREUM: createViemPublicClientForChain(
    ChainId.EthereumMainnet,
    `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  )!,
  POLYGON: createViemPublicClientForChain(
    ChainId.PolygonMainnet,
    `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  )!,
  AVALANCHE: createViemPublicClientForChain(ChainId['AvalancheC-Chain'], 'https://api.avax.network/ext/bc/C/rpc')!,
} as const;

// ALL THE BELOW ARE COPIED FROM REVOKE.CASH AND SHOULD BE EXTRACTED AT SOME POINT

export const getSpenderData = async (
  address: string,
  chainId?: number,
  openseaProxyAddress?: string,
): Promise<SpenderData | null> => {
  if (!chainId) return null;
  if (!address) return null;
  if (address === openseaProxyAddress) return { name: 'OpenSea (old)' };

  return getSpenderDataFromWhois(address, chainId);
};

const getSpenderDataFromWhois = async (address: string, chainId: number): Promise<SpenderData | null> => {
  try {
    const response = await fetch(`${WHOIS_BASE_URL}/spenders/${chainId}/${getAddress(address)}.json`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

export const getOpenSeaProxyAddress = async (userAddress: Address): Promise<Address | null> => {
  try {
    const proxyAddress = await GlobalClients.ETHEREUM.readContract({
      address: OPENSEA_REGISTRY_ADDRESS,
      abi: OPENSEA_REGISTRY_ABI,
      functionName: 'proxies',
      args: [userAddress],
    });

    if (!proxyAddress || proxyAddress === ADDRESS_ZERO) return null;
    return proxyAddress;
  } catch {
    return null;
  }
};
