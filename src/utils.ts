import { ChainId, chains } from 'eth-chains';
import { BigNumber, Contract, providers } from 'ethers';
import { formatUnits, getAddress, Interface } from 'ethers/lib/utils';
import objectHash from 'object-hash';
import { Duplex } from 'readable-stream';
import Browser from 'webextension-polyfill';
import { OpenSeaItemType, Signature, SignatureIdentifier } from './constants';

// TODO: Timeout
export const sendAndAwaitResponseFromStream = (stream: Duplex, data: any): Promise<any> => {
  return new Promise((resolve) => {
    const id = objectHash(data.transaction ?? data.typedData ?? data);
    stream.write({ id, data });

    const callback = (response: any) => {
      if (response.id === id) {
        stream.off('data', callback);
        resolve(response.data);
      }
    };

    stream.on('data', callback);
  });
};

// TODO: Timeout
export const sendAndAwaitResponseFromPort = (stream: Browser.Runtime.Port, data: any): Promise<any> => {
  return new Promise((resolve) => {
    const id = objectHash(data.transaction ?? data.typedData ?? data);
    stream.postMessage({ id, data });

    const callback = (response: any) => {
      if (response.id === id) {
        stream.onMessage.removeListener(callback);
        resolve(response.data);
      }
    };

    stream.onMessage.addListener(callback);
  });
};

export const decodeApproval = (data: string, asset: string) => {
  if (data.startsWith(SignatureIdentifier.approve)) {
    const iface = new Interface([`function ${Signature.approve}`]);
    const decoded = iface.decodeFunctionData(Signature.approve, data);
    const [spender, approval] = Array.from(decoded);
    if (BigNumber.from(approval).isZero()) return undefined;
    return { asset, spender };
  }

  if (data.startsWith(SignatureIdentifier.setApprovalForAll)) {
    const iface = new Interface([`function ${Signature.setApprovalForAll}`])
    const decoded = iface.decodeFunctionData(Signature.setApprovalForAll, data);
    const [spender, approved] = Array.from(decoded);
    if (!approved) return undefined;
    return { asset, spender };
  }

  return undefined;
};

export const decodeOpenSeaListing = (data: any) => {
  const { offer, offerer } = data?.message ?? {};
  if (!offer || !offerer) return undefined;

  const consideration = (data?.message?.consideration ?? []).filter((item: any) => item.recipient === offerer);

  return { offerer, offer, consideration };
}

const BASIC_ERC20 = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
];

export const getOpenSeaItemTokenData = async (item: any, provider: providers.Provider) => {
  const tokenData = await getTokenData(item.token, provider);

  if (item.itemType === OpenSeaItemType.ETHER) {
    return { display: `${formatUnits(item.startAmount, 'ether')} ETH` };
  } else if (item.itemType === OpenSeaItemType.ERC20) {
    return { display: `${formatUnits(item.startAmount, tokenData.decimals)} ${tokenData.symbol}`, asset: item.token };
  } else if (item.itemType === OpenSeaItemType.ERC721) {
    return { display: `${tokenData.name} (${tokenData.symbol}) #${item.identifierOrCriteria}`, asset: item.token };
  } else if (item.itemType === OpenSeaItemType.ERC1155) {
    return { display: `${item.startAmount}x ${tokenData.name} (${tokenData.symbol}) #${item.identifierOrCriteria}`, asset: item.token };
  } else if (item.itemType === OpenSeaItemType.ERC721_CRITERIA) {
    return { display: `multiple ${tokenData.name} (${tokenData.symbol})`, asset: item.token };
  } else if (item.itemType === OpenSeaItemType.ERC1155_CRITERIA) {
    return { display: `multiple ${tokenData.name} (${tokenData.symbol})`, asset: item.token };
  }

  return { display: 'Unknown token' };
}

export const getTokenData = async (address: string, provider: providers.Provider) => {
  return {
    name: await getTokenName(address, provider),
    symbol: await getTokenSymbol(address, provider),
    decimals: await getTokenDecimals(address, provider),
  };
};

const getTokenSymbol = async (address: string, provider: providers.Provider) => {
  try {
    return await new Contract(address, BASIC_ERC20, provider).functions.symbol();
  } catch {
    return undefined;
  }
};

const getTokenDecimals = async (address: string, provider: providers.Provider) => {
  try {
    return await new Contract(address, BASIC_ERC20, provider).functions.decimals();
  } catch {
    return undefined;
  }
};

const getTokenName = async (address: string, provider: providers.Provider) => {
  try {
    return await new Contract(address, BASIC_ERC20, provider).functions.name();
  } catch {
    return undefined;
  }
};

// ALL THE BELOW ARE COPIED FROM REVOKE.CASH AND SHOULD BE EXTRACTED AT SOME POINT

export function getRpcUrl(chainId: number, infuraKey: string = ''): string | undefined {
  // These are not in the eth-chains package, so manually got from chainlist.org
  const overrides: any = {
    [ChainId.ArbitrumOne]: 'https://arb1.arbitrum.io/rpc',
    [ChainId.Moonbeam]: 'https://moonbeam.public.blastapi.io',
    [ChainId.PalmMainnet]: 'https://palm-mainnet.infura.io/v3/3a961d6501e54add9a41aa53f15de99b',
    [5]: `https://goerli.infura.io/v3/${infuraKey}`,
    [ChainId.EthereumTestnetKovan]: `https://kovan.infura.io/v3/${infuraKey}`,
  };

  const [rpcUrl] = chains.get(chainId)?.rpc ?? [];
  return overrides[chainId] ?? rpcUrl?.replace('${INFURA_API_KEY}', infuraKey);
}

export function getExplorerUrl(chainId: number): string | undefined {
  const overrides: any = {
    [ChainId.EthereumTestnetRopsten]: 'https://ropsten.etherscan.io',
    [ChainId.EthereumTestnetKovan]: 'https://kovan.etherscan.io',
    [ChainId.SmartBitcoinCash]: 'https://smartscan.cash',
    [ChainId.Moonbeam]: 'https://moonbeam.moonscan.io',
    [ChainId.Moonriver]: 'https://moonriver.moonscan.io',
  };

  const [explorer] = chains.get(chainId)?.explorers ?? [];

  return overrides[chainId] ?? explorer?.url;
}

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
