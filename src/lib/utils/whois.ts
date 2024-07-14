import { getAddress } from 'viem';
import { HARPIE_API_KEY, WHOIS_BASE_URL } from '../constants';
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

  // Check Harpie only if the whois doesn't have a name, because this is a rate-limited API
  const data = (await getSpenderDataFromWhois(address, chainId)) ?? (await getSpenderDataFromHarpie(address, chainId));

  return data;
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

const getSpenderDataFromHarpie = async (address: string, chainId: number): Promise<SpenderData | null> => {
  const apiKey = HARPIE_API_KEY;
  if (!apiKey || chainId !== 1) return null;

  try {
    const response = await fetch('https://api.harpie.io/getprotocolfromcontract', {
      method: 'POST',
      body: JSON.stringify({ apiKey, address }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data?.contractOwner || data?.contractOwner === 'NO_DATA') return null;
    return { name: data.contractOwner };
  } catch (e) {
    return null;
  }
};
