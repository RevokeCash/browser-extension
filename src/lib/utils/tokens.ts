import { Address, PublicClient, formatUnits } from 'viem';
import { OpenSeaItemType } from '../constants';
import { NftListingItem, TokenData } from '../types';
import { createViemPublicClientForChain } from './chains';

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
] as const;

export const getNftListingItemTokenData = async (item: NftListingItem, chainId: number) => {
  // Some scammers use an incorrect interface using numbers so we convert it to string
  const itemType = String(item.itemType);

  const tokenData = await getTokenData(item.token, chainId);

  if (itemType === OpenSeaItemType.ETHER) {
    return { display: `${formatUnits(BigInt(item.startAmount), 18)} ETH` };
  } else if (itemType === OpenSeaItemType.ERC20) {
    return {
      display: `${formatUnits(BigInt(item.startAmount), Number(tokenData.decimals ?? 18))} ${tokenData.symbol}`,
      asset: item.token,
    };
  } else if (itemType === OpenSeaItemType.ERC721) {
    return { display: `${tokenData.name} (${tokenData.symbol}) #${item.identifierOrCriteria}`, asset: item.token };
  } else if (itemType === OpenSeaItemType.ERC1155) {
    return {
      display: `${item.startAmount}x ${tokenData.name} (${tokenData.symbol}) #${item.identifierOrCriteria}`,
      asset: item.token,
    };
  } else if (itemType === OpenSeaItemType.ERC721_CRITERIA) {
    return { display: `multiple ${tokenData.name} (${tokenData.symbol})`, asset: item.token };
  } else if (itemType === OpenSeaItemType.ERC1155_CRITERIA) {
    return { display: `multiple ${tokenData.name} (${tokenData.symbol})`, asset: item.token };
  }

  return { display: 'Unknown token(s)' };
};

export const getTokenData = async (address: Address, chainId: number): Promise<TokenData> => {
  const client = createViemPublicClientForChain(chainId);

  if (!client) return {};

  return {
    name: await getTokenName(address, client),
    symbol: await getTokenSymbol(address, client),
    decimals: await getTokenDecimals(address, client),
  };
};

const getTokenSymbol = async (address: Address, client: PublicClient) => {
  try {
    return await client.readContract({
      address,
      abi: BASIC_ERC20,
      functionName: 'symbol',
    });
  } catch {
    return undefined;
  }
};

const getTokenDecimals = async (address: Address, client: PublicClient) => {
  try {
    return await client.readContract({
      address,
      abi: BASIC_ERC20,
      functionName: 'decimals',
    });
  } catch {
    return undefined;
  }
};

const getTokenName = async (address: Address, client: PublicClient) => {
  try {
    return await client.readContract({
      address,
      abi: BASIC_ERC20,
      functionName: 'name',
    });
  } catch {
    return undefined;
  }
};
