import { ChainId, chains } from 'eth-chains';
import { providers } from 'ethers';

// ALL THE BELOW ARE COPIED FROM REVOKE.CASH AND SHOULD BE EXTRACTED AT SOME POINT

export const getChainExplorerUrl = (chainId: number): string | undefined => {
  const overrides: Record<number, string> = {
    [ChainId.SmartBitcoinCash]: 'https://smartscan.cash',
    [ChainId.Moonbeam]: 'https://moonbeam.moonscan.io',
    [ChainId.Moonriver]: 'https://moonriver.moonscan.io',
    [ChainId.CeloMainnet]: 'https://celoscan.io',
    [ChainId.CeloAlfajoresTestnet]: 'https://alfajores.celoscan.io',
    [ChainId.AuroraMainnet]: 'https://explorer.aurora.dev',
    [ChainId.BitTorrentChainMainnet]: 'https://bttcscan.com',
    [ChainId.BitTorrentChainTestnet]: 'https://testnet.bttcscan.com',
    [ChainId.CLVParachain]: 'https://clvscan.com',
    [ChainId.SyscoinTanenbaumTestnet]: 'https://tanenbaum.io',
    [ChainId.SyscoinMainnet]: 'https://explorer.syscoin.org',
    [ChainId.Astar]: 'https://blockscout.com/astar',
    [ChainId.Gnosis]: 'https://gnosisscan.io',
    [421613]: 'https://goerli.arbiscan.io',
    [42170]: 'https://nova.arbiscan.io',
    [7700]: 'https://evm.explorer.canto.io',
    [ChainId.KavaEVM]: 'https://explorer.kava.io',
    [ChainId.KavaEVMTestnet]: 'https://explorer.testnet.kava.io',
    [2000]: 'https://explorer.dogechain.dog',
    [568]: 'https://explorer-testnet.dogechain.dog',
    [2109]: 'https://explorer.exosama.com',
    [ChainId.FlareMainnet]: 'https://flare-explorer.flare.network',
    [ChainId['SongbirdCanary-Network']]: 'https://songbird-explorer.flare.network',
    [1662]: 'https://yuma-explorer.horizen.io',
    [324]: 'https://explorer.zksync.io',
    [280]: 'https://goerli.explorer.zksync.io',
    [1442]: 'https://testnet-zkevm.polygonscan.com',
    [1101]: 'https://zkevm.polygonscan.com',
    [ChainId.PulseChainTestnetv3]: 'https://scan.v3.testnet.pulsechain.com',
    [59140]: 'https://explorer.goerli.linea.build',
    [534353]: 'https://blockscout.scroll.io',
    [84531]: 'https://goerli.basescan.org',
    [2611]: 'https://redlightscan.finance',
    [167004]: 'https://explorer.a2.taiko.xyz',
    [1116]: 'https://scan.coredao.org',
    [1071]: 'https://json-rpc.evm.testnet.shimmer.network',
    [248]: 'https://scan.oasys.games',
    [119]: 'https://evmscan.nuls.io',
  };

  const [explorer] = chains.get(chainId)?.explorers ?? [];

  return overrides[chainId] ?? explorer?.url;
};

export const getChainRpcUrl = (chainId: number, infuraKey: string = ''): string | undefined => {
  // These are not in the eth-chains package, so manually got from chainlist.org
  const overrides: Record<number, string> = {
    [ChainId.EthereumMainnet]: `https://mainnet.infura.io/v3/${infuraKey}`,
    [ChainId.Goerli]: `https://goerli.infura.io/v3/${infuraKey}`,
    [ChainId.Sepolia]: `https://sepolia.infura.io/v3/${infuraKey}`,
    [ChainId.ArbitrumOne]: `https://arb1.arbitrum.io/rpc`,
    [421613]: 'https://goerli-rollup.arbitrum.io/rpc',
    [42170]: 'https://nova.arbitrum.io/rpc',
    [ChainId.Moonbeam]: 'https://rpc.api.moonbeam.network',
    [ChainId.Shiden]: 'https://shiden.api.onfinality.io/public',
    [ChainId.GodwokenMainnet]: 'https://v1.mainnet.godwoken.io/rpc',
    [7700]: 'https://canto.slingshot.finance',
    [2000]: 'https://rpc.dogechain.dog',
    [ChainId.FantomTestnet]: 'https://rpc.ankr.com/fantom_testnet',
    [ChainId.KavaEVMTestnet]: 'https://evm.testnet.kava.io',
    [ChainId.Evmos]: 'https://evmos-evm.publicnode.com',
    [ChainId.CallistoMainnet]: 'https://rpc.callisto.network',
    [ChainId.Astar]: 'https://evm.astar.network',
    [ChainId.Optimism]: `https://optimism-mainnet.infura.io/v3/${infuraKey}`,
    [ChainId.OptimisticEthereumTestnetGoerli]: `https://optimism-goerli.infura.io/v3/${infuraKey}`,
    [2109]: 'https://rpc.exosama.com',
    [ChainId.FlareMainnet]: 'https://flare-api.flare.network/ext/C/rpc',
    [ChainId['SongbirdCanary-Network']]: 'https://songbird-api.flare.network/ext/C/rpc',
    [ChainId.CronosMainnetBeta]: 'https://node.croswap.com/rpc',
    [ChainId.CronosTestnet]: 'https://evm-t3.cronos.org',
    [ChainId.Mumbai]: 'https://polygon-mumbai.blockpi.network/v1/rpc/public',
    [1662]: 'https://yuma-testnet.horizenlabs.io/ethv1',
    [324]: 'https://zksync2-mainnet.zksync.io',
    [280]: 'https://zksync2-testnet.zksync.dev',
    [1442]: 'https://rpc.public.zkevm-test.net',
    [1101]: 'https://zkevm-rpc.com',
    [ChainId.PulseChainTestnetv3]: 'https://rpc.v3.testnet.pulsechain.com',
    [59140]: 'https://consensys-zkevm-goerli-prealpha.infura.io/v3/4372a37c341846f0b2ce479dd29a429b', // TODO: Replace
    [534353]: 'https://alpha-rpc.scroll.io/l2',
    [84531]: 'https://goerli.base.org',
    [2611]: 'https://dataseed2.redlightscan.finance',
    [167004]: 'https://rpc.a2.taiko.xyz',
    [1116]: 'https://rpc.coredao.org',
    [1071]: 'https://json-rpc.evm.testnet.shimmer.network',
    [248]: 'https://rpc.mainnet.oasys.games',
    [119]: 'https://evmapi.nuls.io',
  };

  const [rpcUrl] = chains.get(chainId)?.rpc ?? [];
  return overrides[chainId] ?? rpcUrl?.replace('${INFURA_API_KEY}', infuraKey);
};

export const getChainProvider = (chainId: number, infuraKey: string = ''): providers.Provider => {
  const rpcUrl = getChainRpcUrl(chainId, infuraKey) ?? getChainRpcUrl(1, infuraKey);
  return new providers.StaticJsonRpcProvider(rpcUrl, chainId);
};

export const isSupportedChain = (chainId: number) => !!getChainRpcUrl(chainId);

export const getChainName = (chainId: number): string => {
  const overrides: Record<number, string> = {
    [ChainId.EthereumMainnet]: 'Ethereum',
    [ChainId.BinanceSmartChainMainnet]: 'Binance Smart Chain',
    [ChainId['AvalancheC-Chain']]: 'Avalanche',
    [ChainId.PolygonMainnet]: 'Polygon',
    [ChainId.ArbitrumOne]: 'Arbitrum',
    [42170]: 'Arbitrum Nova',
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
    [ChainId['GodwokenTestnet(V1.1)']]: 'Godwoken Testnet',
    [ChainId.SmartBitcoinCash]: 'SmartBCH',
    [ChainId.FuseMainnet]: 'Fuse',
    [ChainId.SyscoinMainnet]: 'Syscoin',
    [ChainId.CLVParachain]: 'CLV',
    [ChainId.BitTorrentChainMainnet]: 'BTT Chain',
    [ChainId.Goerli]: 'Goerli',
    [ChainId.BinanceSmartChainTestnet]: 'BSC Testnet',
    [ChainId.AvalancheFujiTestnet]: 'Avalanche Fuji',
    [ChainId.Mumbai]: 'Polygon Mumbai',
    [ChainId.OptimisticEthereumTestnetGoerli]: 'Optimism Goerli',
    [421613]: 'Arbitrum Goerli',
    [ChainId.CeloAlfajoresTestnet]: 'Celo Alfajores',
    [ChainId.HuobiECOChainTestnet]: 'HECO Testnet',
    [ChainId.MetisStardustTestnet]: 'Metis Stardust',
    [ChainId.TelosEVMTestnet]: 'Telos Testnet',
    [ChainId.SmartBitcoinCashTestnet]: 'SmartBCH Testnet',
    [ChainId.SyscoinTanenbaumTestnet]: 'Syscoin Tenenbaum',
    [ChainId.BitTorrentChainTestnet]: 'BTTC Testnet',
    [ChainId.EmeraldParatimeMainnet]: 'Oasis Emerald',
    [ChainId.EmeraldParatimeTestnet]: 'Oasis Testnet',
    [ChainId.EthereumClassicMainnet]: 'Ethereum Classic',
    [7700]: 'Canto',
    [ChainId.KavaEVM]: 'Kava',
    [ChainId.KavaEVMTestnet]: 'Kava Testnet',
    [2000]: 'Dogechain',
    [568]: 'Dogechain Testnet',
    [ChainId.CallistoMainnet]: 'Callisto',
    [ChainId.NahmiiMainnet]: 'Nahmii',
    [ChainId.CoinExSmartChainMainnet]: 'CoinEx Smart Chain',
    [ChainId.CoinExSmartChainTestnet]: 'CoinEx Testnet',
    [2109]: 'Exosama',
    [ChainId.FlareMainnet]: 'Flare',
    [ChainId['SongbirdCanary-Network']]: 'Songbird',
    [ChainId.BobaNetwork]: 'Boba',
    [1662]: 'Horizen Yuma',
    [324]: 'zkSync Era',
    [280]: 'zkSync Era Goerli',
    [1442]: 'Polygon Test-zkEVM',
    [1101]: 'Polygon zkEVM',
    [ChainId.PulseChainTestnetv3]: 'PulseChain Testnet',
    [59140]: 'Linea Goerli',
    [534353]: 'Scroll Alpha',
    [84531]: 'Base Goerli',
    [2611]: 'Redlight',
    [ChainId.GatherMainnetNetwork]: 'Gather',
    [ChainId.GatherTestnetNetwork]: 'Gather Testnet',
    [167004]: 'Taiko Alpha',
    [1116]: 'CORE',
    [ChainId.KCCMainnet]: 'KCC',
    [1071]: 'Shimmer Testnet',
    [248]: 'Oasys',
    [119]: 'ENULS',
  };

  return overrides[chainId] ?? chains.get(chainId)?.name ?? `Chain ID ${chainId}`;
};
