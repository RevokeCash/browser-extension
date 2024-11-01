// NOTE: THIS FILE IS TAKEN FROM THE REVOKE.CASH CODEBASE WITH MINIMAL MODIFICATIONS

import { getChain } from '@revoke.cash/chains';
import { Address, PublicClient, Chain as ViemChain, createPublicClient, defineChain, http } from 'viem';
import { INFURA_API_KEY } from '../constants';

export interface ChainOptions {
  type: SupportType;
  chainId: number;
  name?: string;
  // slug?: string;
  logoUrl?: string;
  infoUrl?: string;
  nativeToken?: string;
  explorerUrl?: string;
  etherscanCompatibleApiUrl?: string;
  rpc?: {
    main?: string | string[];
    logs?: string;
    free?: string;
  };
  deployedContracts?: DeployedContracts;
  isTestnet?: boolean;
  isCanary?: boolean;
  correspondingMainnetChainId?: number;
}

export type DeployedContracts = Record<string, { address: Address }>;

export enum SupportType {
  PROVIDER = 'provider',
  ETHERSCAN_COMPATIBLE = 'etherscan_compatible',
  COVALENT = 'covalent',
  BACKEND_NODE = 'backend_node',
  UNSUPPORTED = 'unsupported',
}

export class Chain {
  chainId: number;
  type: SupportType;

  constructor(private options: ChainOptions) {
    this.chainId = options.chainId;
    this.type = options.type;
  }

  isSupported(): boolean {
    return this.type !== SupportType.UNSUPPORTED;
  }

  getName(): string {
    const name = this.options.name ?? getChain(this.chainId)?.name ?? `Chain ID ${this.chainId}`;

    return name;
  }

  getSlug(): string {
    const chainName = this.getName();
    return chainName.toLowerCase().replace(' (unsupported)', '').replace(/\s/g, '-').replace(/\./g, '-');
  }

  isTestnet(): boolean {
    return this.options.isTestnet ?? false;
  }

  isCanary(): boolean {
    return this.options.isCanary ?? false;
  }

  getLogoUrl(): string | undefined {
    if (this.options.logoUrl?.startsWith('/')) {
      return `https://revoke.cash${this.options.logoUrl}`;
    }

    return this.options.logoUrl ?? getChain(this.chainId)?.iconURL;
  }

  getExplorerUrl(): string {
    const [explorer] = getChain(this.chainId)?.explorers ?? [];
    return this.options.explorerUrl ?? explorer?.url;
  }

  getFreeRpcUrl(): string {
    const [rpcUrl] = getChain(this.chainId)?.rpc ?? [];
    return this.options.rpc?.free ?? rpcUrl ?? this.getRpcUrl();
  }

  getRpcUrls(): string[] {
    const baseRpcUrls =
      getChain(this.chainId)?.rpc?.map((url) => url.replace('${INFURA_API_KEY}', INFURA_API_KEY)) ?? [];
    const specifiedRpcUrls = [this.options.rpc?.main].flat().filter(Boolean) as string[];
    return [...specifiedRpcUrls, ...baseRpcUrls];
  }

  getRpcUrl(): string {
    return this.getRpcUrls()[0];
  }

  getLogsRpcUrl(): string {
    return this.options.rpc?.logs ?? this.getRpcUrl();
  }

  getInfoUrl(): string | undefined {
    // TODO: Ideally we would call getInfoUrl() for the mainnet chain here in case it has overridden infoUrl, but then
    // we run into circular dependency issues 😅
    const mainnetChainId = this.getCorrespondingMainnetChainId() ?? -1;
    return this.options.infoUrl ?? getChain(mainnetChainId)?.infoURL ?? getChain(this.chainId)?.infoURL;
  }

  getNativeToken(): string {
    return this.options.nativeToken ?? getChain(this.chainId)?.nativeCurrency?.symbol ?? 'ETH';
  }

  getCorrespondingMainnetChainId(): number | undefined {
    return this.options.correspondingMainnetChainId;
  }

  getDeployedContracts(): DeployedContracts | undefined {
    return this.options.deployedContracts;
  }

  getViemChainConfig(): ViemChain {
    const chainInfo = getChain(this.chainId);
    const chainName = this.getName();
    const fallbackNativeCurrency = { name: chainName, symbol: this.getNativeToken(), decimals: 18 };

    return defineChain({
      id: this.chainId,
      name: chainName,
      network: this.getSlug(),
      nativeCurrency: chainInfo?.nativeCurrency ?? fallbackNativeCurrency,
      rpcUrls: {
        default: { http: [this.getRpcUrl()] },
        public: { http: [this.getRpcUrl()] },
      },
      blockExplorers: {
        default: {
          name: chainName + ' Explorer',
          url: this.getExplorerUrl(),
        },
      },
      contracts: this.getDeployedContracts(),
      testnet: this.isTestnet(),
    });
  }

  createViemPublicClient(overrideUrl?: string): PublicClient {
    // @ts-ignore TODO: This gives a TypeScript error since Viem v2
    return createPublicClient({
      pollingInterval: 4_000,
      chain: this.getViemChainConfig(),
      transport: http(overrideUrl ?? this.getRpcUrl()),
      batch: { multicall: true },
    });
  }
}
