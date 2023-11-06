import { Address, getAddress } from 'viem';
import { SpenderData } from '../types';

// ALL THE BELOW ARE COPIED FROM REVOKE.CASH AND SHOULD BE EXTRACTED AT SOME POINT

export const DATA_BASE_URL = 'https://raw.githubusercontent.com/RevokeCash/revoke.cash/master/data';
export const ETHEREUM_LISTS_CONTRACTS = 'https://raw.githubusercontent.com/ethereum-lists/contracts/main';

export const getSpenderData = async (
  address: Address,
  chainId?: number,
  openseaProxyAddress?: Address
): Promise<SpenderData | null> => {
  if (!chainId) return null;
  if (!address) return null;
  if (address === openseaProxyAddress) return { name: 'OpenSea (old)' };

  // Request dapplist and ethereumlists in parallel since they're both just GitHub repos
  const internalPromise = getSpenderDataFromInternal(address, chainId);
  const ethereumListsPromise = getSpenderDataFromEthereumList(address, chainId);

  const data = (await internalPromise) ?? (await ethereumListsPromise);

  return data;
};

const getSpenderDataFromInternal = async (address: Address, chainId: number): Promise<SpenderData | null> => {
  try {
    const res = await fetch(`${DATA_BASE_URL}/spenders/${chainId}/${getAddress(address)}.json`);
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

const getSpenderDataFromEthereumList = async (address: Address, chainId: number): Promise<SpenderData | null> => {
  try {
    const contractRes = await fetch(`${ETHEREUM_LISTS_CONTRACTS}/contracts/${chainId}/${getAddress(address)}.json`);
    const contractData = await contractRes.json();

    try {
      const projectRes = await fetch(`${ETHEREUM_LISTS_CONTRACTS}/projects/${contractData.project}.json`);
      const projectData = await projectRes.json();
      return { name: projectData.name };
    } catch {}

    return { name: contractData.project };
  } catch {
    return null;
  }
};
