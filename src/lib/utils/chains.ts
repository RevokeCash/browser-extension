// ALL THE BELOW ARE COPIED FROM REVOKE.CASH AND SHOULD BE EXTRACTED AT SOME POINT
import { ChainId, chains } from '@revoke.cash/chains';
import { INFURA_API_KEY } from '../constants';
import { Chain, PublicClient, createPublicClient, defineChain, http } from 'viem';

export const getChainName = (chainId: number): string => {
  const overrides: Record<number, string> = {
    [ChainId.ArbitrumGoerli]: 'Arbitrum Goerli',
    [ChainId.ArbitrumNova]: 'Arbitrum Nova',
    [ChainId.ArbitrumOne]: 'Arbitrum',
    [ChainId.AuroraMainnet]: 'Aurora',
    [ChainId['AvalancheC-Chain']]: 'Avalanche',
    [ChainId.AvalancheFujiTestnet]: 'Avalanche Fuji',
    [ChainId.BaseGoerliTestnet]: 'Base Goerli',
    [ChainId.BitgertMainnet]: 'Bitgert',
    [ChainId.BitTorrentChainMainnet]: 'BTT Chain',
    [ChainId.BitTorrentChainTestnet]: 'BTTC Testnet',
    [ChainId.BNBSmartChainMainnet]: 'BNB Chain',
    [ChainId.BNBSmartChainTestnet]: 'BNB Chain Testnet',
    [ChainId.BobaNetwork]: 'Boba',
    [ChainId.CallistoMainnet]: 'Callisto',
    [ChainId.Canto]: 'Canto',
    [ChainId.CeloAlfajoresTestnet]: 'Celo Alfajores',
    [ChainId.CeloMainnet]: 'Celo',
    [ChainId.CoinExSmartChainMainnet]: 'CoinEx Smart Chain',
    [ChainId.CoinExSmartChainTestnet]: 'CoinEx Testnet',
    [ChainId.CoreBlockchainMainnet]: 'CORE',
    [ChainId.CronosMainnet]: 'Cronos',
    [ChainId.DogechainMainnet]: 'Dogechain',
    [ChainId.DogechainTestnet]: 'Dogechain Testnet',
    [ChainId.ElastosSmartChain]: 'Elastos',
    [ChainId.ENULSMainnet]: 'ENULS',
    [ChainId.EthereumClassicMainnet]: 'Ethereum Classic',
    [ChainId.EthereumMainnet]: 'Ethereum',
    [ChainId.ExosamaNetwork]: 'Exosama',
    [ChainId.FantomOpera]: 'Fantom',
    [ChainId.FlareMainnet]: 'Flare',
    [ChainId.FuseMainnet]: 'Fuse',
    [ChainId.GatherMainnetNetwork]: 'Gather',
    [ChainId.GatherTestnetNetwork]: 'Gather Testnet',
    [ChainId.Gnosis]: 'Gnosis Chain',
    [ChainId.GodwokenMainnet]: 'Godwoken',
    [ChainId.Goerli]: 'Ethereum Goerli',
    [ChainId.HarmonyMainnetShard0]: 'Harmony',
    [ChainId.HarmonyTestnetShard0]: 'Harmony Testnet',
    [ChainId.HorizenEONMainnet]: 'Horizen EON',
    [ChainId.HorizenGobiTestnet]: 'Horizen Gobi',
    [ChainId.HuobiECOChainMainnet]: 'HECO',
    [ChainId.HuobiECOChainTestnet]: 'HECO Testnet',
    [ChainId.IoTeXNetworkMainnet]: 'IoTeX',
    [ChainId.IoTeXNetworkTestnet]: 'IoTeX Testnet',
    [ChainId.KardiaChainMainnet]: 'KardiaChain',
    [ChainId.Kava]: 'Kava',
    [ChainId.KavaTestnet]: 'Kava Testnet',
    [ChainId.KCCMainnet]: 'KCC',
    [ChainId.KlaytnMainnetCypress]: 'Klaytn',
    [ChainId.KlaytnTestnetBaobab]: 'Klaytn Baobab',
    [ChainId.Linea]: 'Linea',
    [ChainId.LineaTestnet]: 'Linea Goerli',
    [ChainId.MantaPacificMainnet]: 'Manta Pacific',
    [ChainId.MaxxChainMainnet]: 'MaxxChain',
    [ChainId.MetisAndromedaMainnet]: 'Metis',
    [ChainId.MetisStardustTestnet]: 'Metis Stardust',
    [ChainId.MilkomedaC1Mainnet]: 'Milkomeda C1',
    [ChainId.Mumbai]: 'Polygon Mumbai',
    [ChainId.NahmiiMainnet]: 'Nahmii',
    [ChainId.OasisEmerald]: 'Oasis Emerald',
    [ChainId.OasisEmeraldTestnet]: 'Oasis Testnet',
    [ChainId.OasysMainnet]: 'Oasys',
    [ChainId.OctaSpace]: 'OctaSpace',
    [ChainId.OpBNBMainnet]: 'opBNB',
    [ChainId.OPMainnet]: 'Optimism',
    [ChainId.OptimismGoerliTestnet]: 'Optimism Goerli',
    [ChainId.PegoNetwork]: 'Pego',
    [ChainId['PGN(PublicGoodsNetwork)']]: 'PGN',
    [ChainId.PolygonMainnet]: 'Polygon',
    [ChainId.PolygonzkEVM]: 'Polygon zkEVM',
    [ChainId.PolygonzkEVMTestnet]: 'Polygon zkEVM Testnet',
    [ChainId.PulseChain]: 'PulseChain',
    [ChainId.PulseChainTestnetv4]: 'PulseChain Testnet',
    [ChainId.RedlightChainMainnet]: 'Redlight',
    [ChainId.RolluxMainnet]: 'Rollux',
    [ChainId.RootstockMainnet]: 'Rootstock',
    [ChainId.Scroll]: 'Scroll',
    [ChainId.ScrollSepoliaTestnet]: 'Scroll Sepolia',
    [ChainId.Sepolia]: 'Ethereum Sepolia',
    [ChainId.Shibarium]: 'Shibarium',
    [ChainId.ShimmerEVMMainnet]: 'Shimmer',
    [ChainId.ShimmerEVMTestnet]: 'Shimmer Testnet',
    [ChainId.SmartBitcoinCash]: 'SmartBCH',
    [ChainId['SongbirdCanary-Network']]: 'Songbird',
    [ChainId.SyscoinMainnet]: 'Syscoin',
    [ChainId.SyscoinTanenbaumTestnet]: 'Syscoin Tanenbaum',
    [ChainId.TaikoJolnirL2]: 'Taiko Jolnir',
    [ChainId.TelosEVMMainnet]: 'Telos',
    [ChainId.TelosEVMTestnet]: 'Telos Testnet',
    [ChainId.VelasEVMMainnet]: 'Velas',
    [ChainId['WEMIX3.0Mainnet']]: 'WEMIX',
    [ChainId.XDCNetwork]: 'XDC',
    [ChainId.ZetaChainAthens3Testnet]: 'ZetaChain Athens',
    [ChainId.ZetaChainMainnet]: 'ZetaChain',
    [ChainId.ZkSyncEraMainnet]: 'zkSync Era',
    [ChainId.ZkSyncEraTestnet]: 'zkSync Era Goerli',
    [1234567890]: 'Taiko', // TODO: This is a placeholder so we can add a description for Taiko
  };

  const name = overrides[chainId] ?? chains.get(chainId)?.name ?? `Chain ID ${chainId}`;

  return name;
};

export const getChainExplorerUrl = (chainId: number): string => {
  const overrides: Record<number, string> = {
    [ChainId.ArbitrumGoerli]: 'https://goerli.arbiscan.io',
    [ChainId.ArbitrumNova]: 'https://nova.arbiscan.io',
    [ChainId.Astar]: 'https://blockscout.com/astar',
    [ChainId.AuroraMainnet]: 'https://explorer.aurora.dev',
    [ChainId.BitTorrentChainMainnet]: 'https://bttcscan.com',
    [ChainId.BitTorrentChainTestnet]: 'https://testnet.bttcscan.com',
    [ChainId.CallistoMainnet]: 'https://explorer.callisto.network',
    [ChainId.Canto]: 'https://tuber.build',
    [ChainId.CeloAlfajoresTestnet]: 'https://alfajores.celoscan.io',
    [ChainId.FuseMainnet]: 'https://explorer.fuse.io',
    [ChainId.Gnosis]: 'https://gnosisscan.io',
    [ChainId.GodwokenMainnet]: 'https://www.gwscan.com',
    [ChainId.KardiaChainMainnet]: 'https://explorer.kardiachain.io',
    [ChainId.Linea]: 'https://lineascan.build',
    [ChainId.LineaTestnet]: 'https://goerli.lineascan.build',
    [ChainId.OasysMainnet]: 'https://scan.oasys.games',
    [ChainId.OptimismGoerliTestnet]: 'https://goerli-optimism.etherscan.io',
    [ChainId.PolygonzkEVM]: 'https://zkevm.polygonscan.com',
    [ChainId.PolygonzkEVMTestnet]: 'https://testnet-zkevm.polygonscan.com',
    [ChainId.PulseChain]: 'https://scan.pulsechain.com',
    [ChainId.PulseChainTestnetv4]: 'https://scan.v4.testnet.pulsechain.com',
    [ChainId.Scroll]: 'https://scrollscan.com',
    [ChainId.SmartBitcoinCash]: 'https://www.smartscan.cash',
    [ChainId.Wanchain]: 'https://www.wanscan.org',
    [ChainId.ZetaChainAthens3Testnet]: 'https://zetachain-athens-3.blockscout.com',
  };

  const [explorer] = chains.get(chainId)?.explorers ?? [];

  return overrides[chainId] ?? explorer?.url;
};

export const getChainRpcUrl = (chainId: number): string => {
  const infuraKey = INFURA_API_KEY;

  const overrides: Record<number, string> = {
    [ChainId.ArbitrumOne]: `https://arbitrum-mainnet.infura.io/v3/${infuraKey}`,
    [ChainId.Astar]: 'https://evm.astar.network',
    [ChainId['AvalancheC-Chain']]: `https://avalanche-mainnet.infura.io/v3/${infuraKey}`,
    [ChainId.AvalancheFujiTestnet]: `https://avalanche-fuji.infura.io/v3/${infuraKey}`,
    [ChainId.Base]: 'https://mainnet.base.org',
    [ChainId.Canto]: 'https://mainnode.plexnode.org:8545',
    [ChainId.CoreBlockchainMainnet]: 'https://rpc.coredao.org',
    [ChainId.CronosMainnet]: 'https://cronos.blockpi.network/v1/rpc/public',
    [ChainId.EthereumMainnet]: `https://mainnet.infura.io/v3/${infuraKey}`,
    [ChainId.Evmos]: 'https://evmos-evm.publicnode.com',
    [ChainId.FantomTestnet]: 'https://rpc.ankr.com/fantom_testnet',
    [ChainId.Goerli]: `https://goerli.infura.io/v3/${infuraKey}`,
    [ChainId.HorizenEONMainnet]: 'https://eon-rpc.horizenlabs.io/ethv1',
    [ChainId.Linea]: `https://linea-mainnet.infura.io/v3/${infuraKey}`,
    [ChainId.LineaTestnet]: `https://linea-goerli.infura.io/v3/${infuraKey}`,
    [ChainId.Mumbai]: `https://polygon-mumbai.infura.io/v3/${infuraKey}`,
    [ChainId.OPMainnet]: `https://optimism-mainnet.infura.io/v3/${infuraKey}`,
    [ChainId.OptimismGoerliTestnet]: `https://optimism-goerli.infura.io/v3/${infuraKey}`,
    [ChainId.PolygonMainnet]: `https://polygon-mainnet.infura.io/v3/${infuraKey}`,
    [ChainId.Sepolia]: `https://sepolia.infura.io/v3/${infuraKey}`,
    [ChainId.Shiden]: 'https://shiden.public.blastapi.io',
    [ChainId.XDCNetwork]: 'https://erpc.xdcrpc.com',
    [ChainId.ZetaChainAthens3Testnet]: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
  };

  const [rpcUrl] = chains.get(chainId)?.rpc ?? [];
  return overrides[chainId] ?? rpcUrl?.replace('${INFURA_API_KEY}', infuraKey);
};

export const getChainNativeToken = (chainId: number): string => {
  const overrides: Record<number, string> = {
    [ChainId.BitgertMainnet]: 'BRISE',
    [ChainId.CoinExSmartChainMainnet]: 'CET',
    [ChainId.CoinExSmartChainTestnet]: 'CETT',
  };

  return overrides[chainId] ?? chains.get(chainId)?.nativeCurrency?.symbol ?? 'ETH';
};

export const getViemChainConfig = (chainId: number): Chain | undefined => {
  const chainInfo = chains.get(chainId);
  const chainName = getChainName(chainId);
  const fallbackNativeCurrency = { name: chainName, symbol: getChainNativeToken(chainId), decimals: 18 };

  return defineChain({
    id: chainId,
    name: chainName,
    network: chainName.toLowerCase().replaceAll(' ', '-'),
    nativeCurrency: chainInfo?.nativeCurrency ?? fallbackNativeCurrency,
    rpcUrls: {
      default: { http: [getChainRpcUrl(chainId)] },
      public: { http: [getChainRpcUrl(chainId)] },
    },
    blockExplorers: {
      default: {
        name: chainName + ' Explorer',
        url: getChainExplorerUrl(chainId),
      },
    },
  });
};

export const createViemPublicClientForChain = (chainId: number, url?: string): PublicClient | undefined => {
  const chainRpcUrl = url ?? getChainRpcUrl(chainId);

  if (!chainRpcUrl) return undefined;

  return createPublicClient({
    pollingInterval: 4_000,
    chain: getViemChainConfig(chainId),
    transport: http(chainRpcUrl),
    batch: { multicall: true },
  });
};
