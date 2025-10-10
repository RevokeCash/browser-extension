import ky from 'ky';
import { apiLogin, isNullish } from '../utils';
import { getChainPriceStrategy } from '../utils/chains';
import { isErc721Contract, type TokenContract } from '../utils/tokens';
import { formatUnits } from 'viem';
import type { PriceStrategy } from './PriceStrategy';

export const calculateTokenPrice = (inversePrice: bigint | null, tokenDecimals: number): number | null => {
  return isNullish(inversePrice) ? null : 1 / Number.parseFloat(formatUnits(inversePrice, tokenDecimals));
};

export const getNativeTokenPrice = async (chainId: number): Promise<number | null> => {
  // No server-side authentication needed in extension
  // Return null for now - pricing can be implemented later if needed
  return null;
};

export const getTokenPrice = async (chainId: number, tokenContract: TokenContract): Promise<number | null> => {
  const strategy = getChainPriceStrategy(chainId);
  if (!strategy || !strategySupportsToken(strategy, tokenContract)) return null;

  try {
    const price = await strategy.calculateTokenPrice(tokenContract);
    if (isNullish(price) || Number.isNaN(price) || price === Infinity || price === -Infinity) return null;
    return price;
  } catch {
    return null;
  }
};

export const strategySupportsToken = (strategy: PriceStrategy, tokenContract: TokenContract): boolean => {
  if (isErc721Contract(tokenContract) && !strategy.supportedAssets.includes('ERC721')) return false;
  if (!isErc721Contract(tokenContract) && !strategy.supportedAssets.includes('ERC20')) return false;
  return true;
};
