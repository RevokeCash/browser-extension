import type { TokenContract, TokenStandard } from '../utils/tokens';
import type { PublicClient } from 'viem';

export interface PriceStrategy {
  supportedAssets: TokenStandard[];
  calculateNativeTokenPrice: (publicClient: PublicClient) => Promise<number | null>;
  calculateTokenPrice: (tokenContract: TokenContract) => Promise<number | null>;
}
