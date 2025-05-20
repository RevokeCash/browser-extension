import { getAddress } from 'viem';
import { WHOIS_BASE_URL } from '../constants';
import { SpenderData } from '../types';

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
