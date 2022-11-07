import { Contract, providers } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { OpenSeaItemType } from '../constants';
import { NftListingItem } from '../types';

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

export const getNftListingItemTokenData = async (item: NftListingItem, provider: providers.Provider) => {
  // Some scammers use an incorrect interface using numbers so we convert it to string
  const itemType = String(item.itemType);

  const tokenData = await getTokenData(item.token, provider);

  if (itemType === OpenSeaItemType.ETHER) {
    return { display: `${formatUnits(item.startAmount, 'ether')} ETH` };
  } else if (itemType === OpenSeaItemType.ERC20) {
    return { display: `${formatUnits(item.startAmount, tokenData.decimals)} ${tokenData.symbol}`, asset: item.token };
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

export const getTokenData = async (address: string, provider: providers.Provider) => {
  return {
    name: await getTokenName(address, provider),
    symbol: await getTokenSymbol(address, provider),
    decimals: await getTokenDecimals(address, provider),
  };
};

const getTokenSymbol = async (address: string, provider: providers.Provider) => {
  try {
    const [symbol] = await new Contract(address, BASIC_ERC20, provider).functions.symbol();
    return symbol;
  } catch {
    return undefined;
  }
};

const getTokenDecimals = async (address: string, provider: providers.Provider) => {
  try {
    const [decimals] = await new Contract(address, BASIC_ERC20, provider).functions.decimals();
    return decimals;
  } catch {
    return undefined;
  }
};

const getTokenName = async (address: string, provider: providers.Provider) => {
  try {
    const [name] = await new Contract(address, BASIC_ERC20, provider).functions.name();
    return name;
  } catch {
    return undefined;
  }
};
