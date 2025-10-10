import { ERC20_ABI } from '../abis';
import type { TokenContract, TokenStandard } from '../utils/tokens';
import { isErc721Contract } from '../utils/tokens';
import type { Address, PublicClient } from 'viem';
import type { PriceStrategy } from './PriceStrategy';

export interface AbstractPriceStrategyOptions {
  nativeAsset?: Address;
  supportedAssets: TokenStandard[];
}

export abstract class AbstractPriceStrategy implements PriceStrategy {
  nativeAsset?: Address;
  supportedAssets: TokenStandard[];

  constructor(options: AbstractPriceStrategyOptions) {
    this.nativeAsset = options.nativeAsset;
    this.supportedAssets = options.supportedAssets;
  }

  public async calculateNativeTokenPrice(publicClient: PublicClient): Promise<number | null> {
    if (!this.nativeAsset) {
      throw new Error('Native token type is not supported by this price strategy');
    }

    const tokenPrice = await this.calculateTokenPrice({
      address: this.nativeAsset,
      abi: ERC20_ABI,
      publicClient,
    });

    return tokenPrice;
  }

  public calculateTokenPrice(tokenContract: TokenContract): Promise<number | null> {
    if (!this.strategySupportsToken(tokenContract)) {
      throw new Error('Token type is not supported by this price strategy');
    }

    return this.calculateTokenPriceInternal(tokenContract);
  }

  private strategySupportsToken(tokenContract: TokenContract): boolean {
    if (isErc721Contract(tokenContract) && !this.supportedAssets.includes('ERC721')) return false;
    if (!isErc721Contract(tokenContract) && !this.supportedAssets.includes('ERC20')) return false;
    return true;
  }

  protected abstract calculateTokenPriceInternal(tokenContract: TokenContract): Promise<number | null>;
}
