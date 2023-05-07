// ALL THE BELOW ARE COPIED FROM REVOKE.CASH AND SHOULD BE EXTRACTED AT SOME POINT
import { ChainId, chains } from '@revoke.cash/chains';
import { providers } from 'ethers';
import { INFURA_API_KEY } from '../constants';

export const getChainName = (chainId: number): string => {
  const overrides: Record<number, string> = {
    [ChainId.EthereumMainnet]: 'Ethereum',
    [ChainId.BinanceSmartChainMainnet]: 'Binance Smart Chain',
    [ChainId['AvalancheC-Chain']]: 'Avalanche',
    [ChainId.PolygonMainnet]: 'Polygon',
    [ChainId.ArbitrumOne]: 'Arbitrum',
    [ChainId.ArbitrumNova]: 'Arbitrum Nova',
    [ChainId.CronosMainnetBeta]: 'Cronos',
    [ChainId.FantomOpera]: 'Fantom',
    [ChainId.KlaytnMainnetCypress]: 'Klaytn',
    [ChainId.KlaytnTestnetBaobab]: 'Klaytn Baobab',
    [ChainId.AuroraMainnet]: 'Aurora',
    [ChainId.CeloMainnet]: 'Celo',
    [ChainId.HuobiECOChainMainnet]: 'HECO',
    [ChainId.RSKMainnet]: 'Rootstock',
    [ChainId.MetisAndromedaMainnet]: 'Metis',
    [ChainId.TelosEVMMainnet]: 'Telos',
    [ChainId.IoTeXNetworkMainnet]: 'IoTeX',
    [ChainId.IoTeXNetworkTestnet]: 'IoTeX Testnet',
    [ChainId.HarmonyMainnetShard0]: 'Harmony',
    [ChainId.HarmonyTestnetShard0]: 'Harmony Testnet',
    [ChainId.GodwokenMainnet]: 'Godwoken',
    [ChainId.GodwokenTestnetv1]: 'Godwoken Testnet',
    [ChainId.SmartBitcoinCash]: 'SmartBCH',
    [ChainId.FuseMainnet]: 'Fuse',
    [ChainId.SyscoinMainnet]: 'Syscoin',
    [ChainId.CLVParachain]: 'CLV',
    [ChainId.BitTorrentChainMainnet]: 'BTT Chain',
    [ChainId.Goerli]: 'Goerli',
    [ChainId.BinanceSmartChainTestnet]: 'BSC Testnet',
    [ChainId.AvalancheFujiTestnet]: 'Avalanche Fuji',
    [ChainId.Mumbai]: 'Polygon Mumbai',
    [ChainId.OptimismGoerliTestnet]: 'Optimism Goerli',
    [ChainId.ArbitrumGoerli]: 'Arbitrum Goerli',
    [ChainId.CeloAlfajoresTestnet]: 'Celo Alfajores',
    [ChainId.HuobiECOChainTestnet]: 'HECO Testnet',
    [ChainId.MetisStardustTestnet]: 'Metis Stardust',
    [ChainId.TelosEVMTestnet]: 'Telos Testnet',
    [ChainId.SmartBitcoinCashTestnet]: 'SmartBCH Testnet',
    [ChainId.SyscoinTanenbaumTestnet]: 'Syscoin Tenenbaum',
    [ChainId.BitTorrentChainTestnet]: 'BTTC Testnet',
    [ChainId.OasisEmerald]: 'Oasis Emerald',
    [ChainId.OasisEmeraldTestnet]: 'Oasis Testnet',
    [ChainId.EthereumClassicMainnet]: 'Ethereum Classic',
    [ChainId.Canto]: 'Canto',
    [ChainId.KavaEVM]: 'Kava',
    [ChainId.KavaEVMTestnet]: 'Kava Testnet',
    [ChainId.DogechainMainnet]: 'Dogechain',
    [ChainId.DogechainTestnet]: 'Dogechain Testnet',
    [ChainId.CallistoMainnet]: 'Callisto',
    [ChainId.NahmiiMainnet]: 'Nahmii',
    [ChainId.CoinExSmartChainMainnet]: 'CoinEx Smart Chain',
    [ChainId.CoinExSmartChainTestnet]: 'CoinEx Testnet',
    [ChainId.ExosamaNetwork]: 'Exosama',
    [ChainId.FlareMainnet]: 'Flare',
    [ChainId['SongbirdCanary-Network']]: 'Songbird',
    [ChainId.BobaNetwork]: 'Boba',
    [ChainId.HorizenGobiTestnet]: 'Horizen Gobi',
    [ChainId.ZkSyncEraMainnet]: 'zkSync Era',
    [ChainId.ZkSyncEraTestnet]: 'zkSync Era Goerli',
    [ChainId.PolygonzkEVM]: 'Polygon zkEVM',
    [ChainId.PolygonzkEVMTestnet]: 'Polygon Test-zkEVM',
    [ChainId.PulseChainTestnetv3]: 'PulseChain Testnet',
    [ChainId.LineaTestnet]: 'Linea Goerli',
    [ChainId.ScrollAlphaTestnet]: 'Scroll Alpha',
    [ChainId.BaseGoerliTestnet]: 'Base Goerli',
    [ChainId.RedlightChainMainnet]: 'Redlight',
    [ChainId.GatherMainnetNetwork]: 'Gather',
    [ChainId.GatherTestnetNetwork]: 'Gather Testnet',
    [ChainId['Taiko(Alpha-2Testnet)']]: 'Taiko Alpha',
    [ChainId.CoreBlockchainMainnet]: 'CORE',
    [ChainId.KCCMainnet]: 'KCC',
    [ChainId.ShimmerEVMTestnet]: 'Shimmer Testnet',
    [ChainId.OasysMainnet]: 'Oasys',
    [ChainId.ENULSMainnet]: 'ENULS',
  };

  return overrides[chainId] ?? chains.get(chainId)?.name ?? `Chain ID ${chainId}`;
};

export const getChainExplorerUrl = (chainId: number): string | undefined => {
  const overrides: Record<number, string> = {
    [ChainId.SmartBitcoinCash]: 'https://smartscan.cash',
    [ChainId.CeloAlfajoresTestnet]: 'https://alfajores.celoscan.io',
    [ChainId.AuroraMainnet]: 'https://explorer.aurora.dev',
    [ChainId.BitTorrentChainMainnet]: 'https://bttcscan.com',
    [ChainId.BitTorrentChainTestnet]: 'https://testnet.bttcscan.com',
    [ChainId.CLVParachain]: 'https://clvscan.com',
    [ChainId.Astar]: 'https://blockscout.com/astar',
    [ChainId.Gnosis]: 'https://gnosisscan.io',
    [ChainId.ArbitrumGoerli]: 'https://goerli.arbiscan.io',
    [ChainId.ArbitrumNova]: 'https://nova.arbiscan.io',
    [ChainId.KavaEVMTestnet]: 'https://explorer.testnet.kava.io',
    [ChainId.PolygonzkEVM]: 'https://zkevm.polygonscan.com',
    [ChainId.PolygonzkEVMTestnet]: 'https://testnet-zkevm.polygonscan.com',
    [ChainId.PulseChainTestnetv3]: 'https://scan.v3.testnet.pulsechain.com',
    [ChainId.LineaTestnet]: 'https://explorer.goerli.linea.build',
    [ChainId.OasysMainnet]: 'https://scan.oasys.games',
    [ChainId.OptimismGoerliTestnet]: 'https://goerli-optimism.etherscan.io',
    [ChainId.FuseMainnet]: 'https://explorer.fuse.io',
    [ChainId.CallistoMainnet]: 'https://explorer.callisto.network',
    [ChainId.GodwokenMainnet]: 'https://www.gwscan.com',
  };

  const [explorer] = chains.get(chainId)?.explorers ?? [];

  return overrides[chainId] ?? explorer?.url;
};

export const getChainRpcUrl = (chainId: number): string | undefined => {
  const infuraKey = INFURA_API_KEY;

  const overrides: Record<number, string> = {
    [ChainId.EthereumMainnet]: `https://mainnet.infura.io/v3/${infuraKey}`,
    [ChainId.Goerli]: `https://goerli.infura.io/v3/${infuraKey}`,
    [ChainId.Sepolia]: `https://sepolia.infura.io/v3/${infuraKey}`,
    [ChainId.ArbitrumOne]: `https://arb1.arbitrum.io/rpc`,
    [ChainId.FantomTestnet]: 'https://rpc.ankr.com/fantom_testnet',
    [ChainId.Evmos]: 'https://evmos-evm.publicnode.com',
    [ChainId.Astar]: 'https://evm.astar.network',
    [ChainId.Optimism]: `https://optimism-mainnet.infura.io/v3/${infuraKey}`,
    [ChainId.OptimismGoerliTestnet]: `https://optimism-goerli.infura.io/v3/${infuraKey}`,
    [ChainId.CronosMainnetBeta]: 'https://node.croswap.com/rpc',
    [ChainId.Mumbai]: 'https://polygon-mumbai.blockpi.network/v1/rpc/public',
    [ChainId.LineaTestnet]: 'https://consensys-zkevm-goerli-prealpha.infura.io/v3/4372a37c341846f0b2ce479dd29a429b', // TODO: Replace
  };

  const [rpcUrl] = chains.get(chainId)?.rpc ?? [];
  return overrides[chainId] ?? rpcUrl?.replace('${INFURA_API_KEY}', infuraKey);
};

export const getChainProvider = (chainId: number): providers.Provider => {
  const rpcUrl = getChainRpcUrl(chainId) ?? getChainRpcUrl(1);
  return new providers.StaticJsonRpcProvider(rpcUrl, chainId);
};
