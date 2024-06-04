import { PublicClient, Address as TAddress, formatUnits } from 'viem';
import { Address, OpenSeaItemType } from '../constants';
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

export interface ListingItemDisplayData {
  asset: {
    name?: string;
    symbol?: string;
    address?: TAddress;
  };
  specification?: string;
}

export const getNftListingItemTokenData = async (
  item: NftListingItem,
  chainId: number
): Promise<ListingItemDisplayData> => {
  // Some scammers use an incorrect interface using numbers so we convert it to string
  const itemType = String(item.itemType);

  const tokenData = await getTokenData(item.token, chainId);

  if (itemType === OpenSeaItemType.ETHER) {
    return {
      asset: {
        name: 'Ether',
        symbol: 'ETH',
        address: undefined,
      },
      specification: `${formatUnits(BigInt(item.startAmount), 18)}`,
    };
  } else if (itemType === OpenSeaItemType.ERC20) {
    return {
      asset: {
        name: tokenData.name,
        symbol: tokenData.symbol,
        address: item.token,
      },
      specification: `${formatUnits(BigInt(item.startAmount), Number(tokenData.decimals ?? 18))}`,
    };
  } else if (itemType === OpenSeaItemType.ERC721) {
    return {
      asset: {
        name: tokenData.name,
        symbol: tokenData.symbol,
        address: item.token,
      },
      specification: `#${item.identifierOrCriteria}`,
    };
  } else if (itemType === OpenSeaItemType.ERC1155) {
    return {
      asset: {
        name: tokenData.name,
        symbol: tokenData.symbol,
        address: item.token,
      },
      specification: `${item.startAmount}x #${item.identifierOrCriteria}`,
    };
  } else if (itemType === OpenSeaItemType.ERC721_CRITERIA || itemType === OpenSeaItemType.ERC1155_CRITERIA) {
    return {
      asset: {
        name: tokenData.name,
        symbol: tokenData.symbol,
        address: item.token,
      },
      specification: `multiple`,
    };
  }

  if (item.token === Address.ZERO) {
    return { asset: { name: 'Unknown Asset(s)' } };
  }

  return { asset: { address: item.token } };
};

export const getTokenData = async (address: TAddress, chainId: number): Promise<TokenData> => {
  const client = createViemPublicClientForChain(chainId);

  if (!client) return {};

  return {
    name: await getTokenName(address, client),
    symbol: await getTokenSymbol(address, client),
    decimals: await getTokenDecimals(address, client),
  };
};

const getTokenSymbol = async (address: TAddress, client: PublicClient) => {
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

const getTokenDecimals = async (address: TAddress, client: PublicClient) => {
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

const getTokenName = async (address: TAddress, client: PublicClient) => {
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
