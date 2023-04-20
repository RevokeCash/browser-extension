import { ChainId, chains } from 'eth-chains';
import { providers } from 'ethers';

// ALL THE BELOW ARE COPIED FROM REVOKE.CASH AND SHOULD BE EXTRACTED AT SOME POINT

export const getChainExplorerUrl = (chainId: number): string | undefined => {
  const overrides: { [chainId: number]: string } = {
    [ChainId.SmartBitcoinCash]: 'https://smartscan.cash',
    [ChainId.Moonbeam]: 'https://moonbeam.moonscan.io',
    [ChainId.Moonriver]: 'https://moonriver.moonscan.io',
    [ChainId.CeloMainnet]: 'https://celoscan.io',
    [ChainId.CeloAlfajoresTestnet]: 'https://alfajores.celoscan.io',
    [ChainId.AuroraMainnet]: 'https://aurorascan.dev',
    [ChainId.AuroraTestnet]: 'https://testnet.aurorascan.dev',
    [ChainId.BitTorrentChainMainnet]: 'https://bttcscan.com',
    [ChainId.BitTorrentChainTestnet]: 'https://testnet.bttcscan.com',
    [ChainId.CLVParachain]: 'https://clvscan.com',
    [ChainId.SyscoinTanenbaumTestnet]: 'https://tanenbaum.io',
    [ChainId.SyscoinMainnet]: 'https://explorer.syscoin.org',
    [ChainId.Astar]: 'https://blockscout.com/astar',
    [ChainId.Gnosis]: 'https://gnosisscan.io',
    [421613]: 'https://goerli.arbiscan.io',
    [42170]: 'https://nova.arbiscan.io',
  };

  const [explorer] = chains.get(chainId)?.explorers ?? [];

  return overrides[chainId] ?? explorer?.url;
};

export const getChainRpcUrl = (chainId: number, infuraKey: string = ''): string | undefined => {
  // These are not in the eth-chains package, so manually got from chainlist.org
  const overrides: { [chainId: number]: string } = {
    [ChainId.ArbitrumOne]: 'https://arb1.arbitrum.io/rpc',
    [421613]: 'https://goerli-rollup.arbitrum.io/rpc',
    [42170]: 'https://nova.arbitrum.io/rpc',
    [ChainId.Moonbeam]: 'https://moonbeam.public.blastapi.io',
    [ChainId.Sepolia]: `https://sepolia.infura.io/v3/${infuraKey}`,
    [ChainId.Shiden]: 'https://shiden.public.blastapi.io',
    [ChainId.GodwokenMainnet]: 'https://v1.mainnet.godwoken.io/rpc',
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
  const overrides: { [chainId: number]: string } = {
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
    [ChainId.RSKMainnet]: 'RSK',
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
  };

  return overrides[chainId] ?? chains.get(chainId)?.name ?? `Chain ID ${chainId}`;
};
