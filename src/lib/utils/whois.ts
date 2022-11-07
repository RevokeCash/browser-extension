import { getAddress } from 'ethers/lib/utils';

// ALL THE BELOW ARE COPIED FROM REVOKE.CASH AND SHOULD BE EXTRACTED AT SOME POINT

export const DAPP_LIST_BASE_URL = 'https://revoke.cash/dapp-contract-list';
export const ETHEREUM_LISTS_CONTRACTS = 'https://raw.githubusercontent.com/ethereum-lists/contracts/main';

// Look up an address' App Name using the dapp-contract-list
export async function addressToAppName(address: string, chainId?: number): Promise<string | undefined> {
  if (!chainId) return undefined;
  const name = (await getNameFromDappList(address, chainId)) ?? (await getNameFromEthereumList(address, chainId));
  return name;
}

async function getNameFromDappList(address: string, chainId: number): Promise<string | undefined> {
  try {
    const res = await fetch(`${DAPP_LIST_BASE_URL}/${chainId}/${getAddress(address)}.json`);
    const data = await res.json();
    return data.appName;
  } catch (e) {
    return undefined;
  }
}

async function getNameFromEthereumList(address: string, chainId: number): Promise<string | undefined> {
  try {
    const contractRes = await fetch(`${ETHEREUM_LISTS_CONTRACTS}/contracts/${chainId}/${getAddress(address)}.json`);
    const contractData = await contractRes.json();

    try {
      const projectRes = await fetch(`${ETHEREUM_LISTS_CONTRACTS}/projects/${contractData.project}.json`);
      const projectData = await projectRes.json();
      return projectData.name;
    } catch {}

    return contractData.project;
  } catch {
    return undefined;
  }
}
