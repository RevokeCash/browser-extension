import { ChainId } from '@revoke.cash/chains';
import { PublicClient, Chain as ViemChain } from 'viem';
import { Chain, SupportType } from '../chains/Chain';
import { ALCHEMY_API_KEY, INFURA_API_KEY } from '../constants';

const MULTICALL = {
  multicall3: {
    address: '0xcA11bde05977b3631167028862bE2a173976CA11' as const,
  },
};

export const CHAINS: Record<number, Chain> = {
  [ChainId.Amoy]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.Amoy,
    name: 'Polygon Amoy',
    logoUrl: '/assets/images/vendor/chains/polygon.svg',
    rpc: {
      main: `https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.PolygonMainnet,
  }),
  [ChainId.ArbitrumNova]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.ArbitrumNova,
    name: 'Arbitrum Nova',
    logoUrl: '/assets/images/vendor/chains/arbitrum-nova.svg',
    explorerUrl: 'https://nova.arbiscan.io',
    etherscanCompatibleApiUrl: 'https://api-nova.arbiscan.io/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.ArbitrumOne]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.ArbitrumOne,
    name: 'Arbitrum',
    logoUrl: '/assets/images/vendor/chains/arbitrum.svg',
    explorerUrl: 'https://arbiscan.io',
    rpc: {
      main: `https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      free: 'https://arb1.arbitrum.io/rpc',
    },
  }),
  [ChainId.ArbitrumSepolia]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.ArbitrumSepolia,
    name: 'Arbitrum Sepolia',
    logoUrl: '/assets/images/vendor/chains/arbitrum.svg',
    explorerUrl: 'https://sepolia.arbiscan.io',
    rpc: {
      main: `https://arbitrum-sepolia.infura.io/v3/${INFURA_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.ArbitrumOne,
  }),
  [ChainId.Astar]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Astar,
    name: 'Astar',
    logoUrl: '/assets/images/vendor/chains/astar.svg',
    explorerUrl: 'https://blockscout.com/astar',
    etherscanCompatibleApiUrl: 'https://blockscout.com/astar/api',
    rpc: {
      main: 'https://evm.astar.network',
      free: 'https://evm.astar.network',
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.AstarzkEVM]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.AstarzkEVM,
    name: 'Astar zkEVM',
    logoUrl: '/assets/images/vendor/chains/astar.svg',
    etherscanCompatibleApiUrl: 'https://astar-zkevm.explorer.startale.com/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.AuroraMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.AuroraMainnet,
    name: 'Aurora',
    logoUrl: '/assets/images/vendor/chains/aurora.svg',
    explorerUrl: 'https://explorer.aurora.dev',
    etherscanCompatibleApiUrl: 'https://old.explorer.aurora.dev/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId['AvalancheC-Chain']]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId['AvalancheC-Chain'],
    name: 'Avalanche',
    logoUrl: '/assets/images/vendor/chains/avalanche.svg',
    explorerUrl: 'https://snowscan.xyz',
    etherscanCompatibleApiUrl: 'https://api.snowscan.xyz/api',
    rpc: {
      main: `https://avalanche-mainnet.infura.io/v3/${INFURA_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.AvalancheFujiTestnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.AvalancheFujiTestnet,
    name: 'Avalanche Fuji',
    logoUrl: '/assets/images/vendor/chains/avalanche.svg',
    explorerUrl: 'https://testnet.snowscan.xyz',
    etherscanCompatibleApiUrl: 'https://api-testnet.snowscan.xyz/api',
    rpc: {
      main: `https://avalanche-fuji.infura.io/v3/${INFURA_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId['AvalancheC-Chain'],
  }),
  [ChainId.Base]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.Base,
    name: 'Base',
    logoUrl: '/assets/images/vendor/chains/base.svg',
    etherscanCompatibleApiUrl: 'https://api.basescan.org/api',
    rpc: {
      main: `https://base-mainnet.infura.io/v3/${INFURA_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.BaseSepoliaTestnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.BaseSepoliaTestnet,
    name: 'Base Sepolia',
    logoUrl: '/assets/images/vendor/chains/base.svg',
    etherscanCompatibleApiUrl: 'https://api-sepolia.basescan.org/api',
    rpc: {
      main: `https://base-sepolia.infura.io/v3/${INFURA_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.Base,
  }),
  [ChainId.Beam]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.Beam,
    name: 'Beam',
    logoUrl: '/assets/images/vendor/chains/beam.svg',
    explorerUrl: 'https://4337.routescan.io',
    rpc: {
      main: 'https://build.onbeam.com/rpc',
    },
    deployedContracts: {
      multicall3: { address: '0x4956F15eFdc3dC16645e90Cc356eAFA65fFC65Ec' },
    },
  }),
  [ChainId.BeamTestnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.BeamTestnet,
    name: 'Beam Testnet',
    logoUrl: '/assets/images/vendor/chains/beam.svg',
    deployedContracts: {
      multicall3: { address: '0x9BF49b704EE2A095b95c1f2D4EB9010510c41C9E' },
    },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.Beam,
  }),
  [ChainId.BerachainArtio]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.BerachainArtio,
    name: 'Berachain Artio',
    logoUrl: '/assets/images/vendor/chains/berachain.jpg',
    etherscanCompatibleApiUrl: 'https://api.routescan.io/v2/network/testnet/evm/80085/etherscan/api',
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: 12345678903, // TODO: This is a placeholder so we can add a description for Berachain
  }),
  [ChainId.BitgertMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.BitgertMainnet,
    name: 'Bitgert',
    logoUrl: '/assets/images/vendor/chains/bitgert.svg',
    etherscanCompatibleApiUrl: 'https://brisescan.com/api',
    nativeToken: 'BRISE',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.BitrockMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.BitrockMainnet,
    name: 'Bitrock',
    logoUrl: '/assets/images/vendor/chains/bitrock.svg',
    etherscanCompatibleApiUrl: 'https://explorer.bit-rock.io/api',
  }),
  [ChainId.BitTorrentChainMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.BitTorrentChainMainnet,
    name: 'BTT Chain',
    logoUrl: '/assets/images/vendor/chains/bttc.svg',
    explorerUrl: 'https://bttcscan.com',
    etherscanCompatibleApiUrl: 'https://api.bttcscan.com/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.Blast]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Blast,
    name: 'Blast',
    logoUrl: '/assets/images/vendor/chains/blast.jpg',
    explorerUrl: 'https://blastscan.io',
    etherscanCompatibleApiUrl: 'https://api.blastscan.io/api',
    rpc: {
      main: 'https://rpc.ankr.com/blast',
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.BlastSepoliaTestnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.BlastSepoliaTestnet,
    name: 'Blast Sepolia',
    logoUrl: '/assets/images/vendor/chains/blast.jpg',
    explorerUrl: 'https://sepolia.blastscan.io',
    etherscanCompatibleApiUrl: 'https://api-sepolia.blastscan.io/api',
    rpc: {
      main: 'https://sepolia.blast.io',
    },
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.Blast,
  }),
  [ChainId.BNBSmartChainMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.BNBSmartChainMainnet,
    name: 'BNB Chain',
    logoUrl: '/assets/images/vendor/chains/bnb-chain.svg',
    etherscanCompatibleApiUrl: 'https://api.bscscan.com/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.BNBSmartChainTestnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.BNBSmartChainTestnet,
    name: 'BNB Chain Testnet',
    logoUrl: '/assets/images/vendor/chains/bnb-chain.svg',
    etherscanCompatibleApiUrl: 'https://api-testnet.bscscan.com/api',
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.BNBSmartChainMainnet,
  }),
  [ChainId.BOB]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.BOB,
    name: 'BOB',
    logoUrl: '/assets/images/vendor/chains/bob.svg',
    etherscanCompatibleApiUrl: 'https://explorer.gobob.xyz/api',
  }),
  [ChainId.BobaNetwork]: new Chain({
    type: SupportType.COVALENT,
    chainId: ChainId.BobaNetwork,
    name: 'Boba',
    logoUrl: '/assets/images/vendor/chains/boba.jpg',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.CallistoMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.CallistoMainnet,
    name: 'Callisto',
    logoUrl: '/assets/images/vendor/chains/callisto.png',
    explorerUrl: 'https://explorer.callisto.network',
    etherscanCompatibleApiUrl: 'https://explorer.callisto.network/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.Canto]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Canto,
    name: 'Canto',
    logoUrl: '/assets/images/vendor/chains/canto.svg',
    explorerUrl: 'https://tuber.build',
    etherscanCompatibleApiUrl: 'https://explorer.plexnode.wtf/api',
    rpc: {
      main: 'https://mainnode.plexnode.org:8545',
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.CeloAlfajoresTestnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.CeloAlfajoresTestnet,
    name: 'Celo Alfajores',
    logoUrl: '/assets/images/vendor/chains/celo.svg',
    explorerUrl: 'https://alfajores.celoscan.io',
    rpc: {
      main: `https://celo-alfajores.infura.io/v3/${INFURA_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.CeloMainnet,
  }),
  [ChainId.CeloMainnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.CeloMainnet,
    name: 'Celo',
    logoUrl: '/assets/images/vendor/chains/celo.svg',
    rpc: {
      main: `https://celo-mainnet.infura.io/v3/${INFURA_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.CoinExSmartChainMainnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.CoinExSmartChainMainnet,
    name: 'CoinEx Smart Chain',
    logoUrl: '/assets/images/vendor/chains/coinex.svg',
    nativeToken: 'CET',
  }),
  [ChainId.CoinExSmartChainTestnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.CoinExSmartChainTestnet,
    name: 'CoinEx Testnet',
    logoUrl: '/assets/images/vendor/chains/coinex.svg',
    nativeToken: 'CETT',
    isTestnet: true,
    correspondingMainnetChainId: ChainId.CoinExSmartChainMainnet,
  }),
  [ChainId.CoreBlockchainMainnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.CoreBlockchainMainnet,
    name: 'CORE',
    logoUrl: '/assets/images/vendor/chains/core.png',
    rpc: {
      main: 'https://rpc.coredao.org',
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.CrabNetwork]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.CrabNetwork,
    name: 'Crab',
    logoUrl: '/assets/images/vendor/chains/crab.svg',
    etherscanCompatibleApiUrl: 'https://crab.subview.xyz/api',
    rpc: {
      main: 'https://crab-rpc.darwiniacommunitydao.xyz',
    },
    deployedContracts: { ...MULTICALL },
    isCanary: true,
    correspondingMainnetChainId: ChainId.DarwiniaNetwork,
  }),
  [ChainId.CronosMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.CronosMainnet,
    name: 'Cronos',
    logoUrl: '/assets/images/vendor/chains/cronos.svg',
    etherscanCompatibleApiUrl: 'https://cronos.org/explorer/api',
    rpc: {
      main: 'https://evm.cronos.org',
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.CronosTestnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.CronosTestnet,
    name: 'Cronos Testnet',
    logoUrl: '/assets/images/vendor/chains/cronos.svg',
    etherscanCompatibleApiUrl: 'https://cronos.org/explorer/testnet3/api',
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.CronosMainnet,
  }),
  [ChainId.DarwiniaNetwork]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.DarwiniaNetwork,
    name: 'Darwinia',
    logoUrl: '/assets/images/vendor/chains/darwinia.svg',
    etherscanCompatibleApiUrl: 'https://darwinia.subview.xyz/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.DegenChain]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.DegenChain,
    name: 'Degen Chain',
    logoUrl: '/assets/images/vendor/chains/degen.png',
    explorerUrl: 'https://explorer.degen.tips',
    etherscanCompatibleApiUrl: 'https://explorer.degen.tips/api',
    rpc: {
      main: 'https://rpc.degen.tips',
    },
  }),
  [ChainId.DogechainMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.DogechainMainnet,
    name: 'Dogechain',
    logoUrl: '/assets/images/vendor/chains/dogechain.jpg',
    etherscanCompatibleApiUrl: 'https://explorer.dogechain.dog/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.ElastosSmartChain]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.ElastosSmartChain,
    name: 'Elastos',
    logoUrl: '/assets/images/vendor/chains/elastos.jpg',
    etherscanCompatibleApiUrl: 'https://esc.elastos.io/api',
    rpc: {
      main: 'https://rpc.glidefinance.io',
    },
  }),
  [ChainId.ENULSMainnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.ENULSMainnet,
    name: 'ENULS',
    logoUrl: '/assets/images/vendor/chains/enuls.svg',
    etherscanCompatibleApiUrl: 'https://evmscan.nuls.io/api',
  }),
  [ChainId.EOSEVMNetwork]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.EOSEVMNetwork,
    name: 'EOS EVM',
    logoUrl: '/assets/images/vendor/chains/eos.svg',
    etherscanCompatibleApiUrl: 'https://explorer.evm.eosnetwork.com/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.EthereumClassic]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.EthereumClassic,
    name: 'Ethereum Classic',
    logoUrl: '/assets/images/vendor/chains/etc.png',
    etherscanCompatibleApiUrl: 'https://blockscout.com/etc/mainnet/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.EthereumMainnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.EthereumMainnet,
    name: 'Ethereum',
    logoUrl: '/assets/images/vendor/chains/ethereum.svg',
    rpc: {
      main: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      free: 'https://eth.llamarpc.com',
    },
    deployedContracts: {
      ...MULTICALL,
      ensRegistry: { address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' },
      ensUniversalResolver: { address: '0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62' },
    },
  }),
  [ChainId.Evmos]: new Chain({
    type: SupportType.COVALENT,
    chainId: ChainId.Evmos,
    name: 'Evmos',
    logoUrl: '/assets/images/vendor/chains/evmos.svg',
    rpc: {
      main: 'https://evmos-mainnet.public.blastapi.io',
      free: 'https://evmos-mainnet.public.blastapi.io',
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.ExosamaNetwork]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.ExosamaNetwork,
    name: 'Exosama',
    logoUrl: '/assets/images/vendor/chains/exosama.png',
  }),
  [ChainId.FantomOpera]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.FantomOpera,
    name: 'Fantom',
    logoUrl: '/assets/images/vendor/chains/fantom.svg',
    etherscanCompatibleApiUrl: 'https://api.ftmscan.com/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.FantomTestnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.FantomTestnet,
    name: 'Fantom Testnet',
    logoUrl: '/assets/images/vendor/chains/fantom.svg',
    etherscanCompatibleApiUrl: 'https://api-testnet.ftmscan.com/api',
    rpc: {
      main: 'https://rpc.ankr.com/fantom_testnet',
    },
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.FantomOpera,
  }),
  [ChainId.FlareMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.FlareMainnet,
    name: 'Flare',
    logoUrl: '/assets/images/vendor/chains/flare.svg',
    etherscanCompatibleApiUrl: 'https://flare-explorer.flare.network/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.FrameTestnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.FrameTestnet,
    name: 'Frame Testnet',
    logoUrl: '/assets/images/vendor/chains/frame.jpg',
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: 12345678902, // TODO: This is a placeholder so we can add a description for Frame
  }),
  [ChainId.Fraxtal]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Fraxtal,
    name: 'Fraxtal',
    logoUrl: '/assets/images/vendor/chains/fraxtal.svg',
    etherscanCompatibleApiUrl: 'https://api.fraxscan.com/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.FraxtalTestnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.FraxtalTestnet,
    name: 'Fraxtal Holesky',
    logoUrl: '/assets/images/vendor/chains/fraxtal.svg',
    etherscanCompatibleApiUrl: 'https://api-holesky.fraxscan.com/api',
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.Fraxtal,
  }),
  [ChainId.FuseMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.FuseMainnet,
    name: 'Fuse',
    logoUrl: '/assets/images/vendor/chains/fuse.png',
    explorerUrl: 'https://explorer.fuse.io',
    etherscanCompatibleApiUrl: 'https://explorer.fuse.io/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.Gnosis]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Gnosis,
    name: 'Gnosis Chain',
    logoUrl: '/assets/images/vendor/chains/gnosis.svg',
    explorerUrl: 'https://gnosisscan.io',
    etherscanCompatibleApiUrl: 'https://api.gnosisscan.io/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.GoldXChainMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.GoldXChainMainnet,
    name: 'GoldX',
    logoUrl: '/assets/images/vendor/chains/goldx.jpg',
    etherscanCompatibleApiUrl: 'https://explorer.goldxchain.io/api',
  }),
  [ChainId.HarmonyMainnetShard0]: new Chain({
    type: SupportType.COVALENT,
    chainId: ChainId.HarmonyMainnetShard0,
    name: 'Harmony',
    logoUrl: '/assets/images/vendor/chains/harmony.svg',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.Holesky]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Holesky,
    name: 'Ethereum Holesky',
    logoUrl: '/assets/images/vendor/chains/ethereum.svg',
    etherscanCompatibleApiUrl: 'https://api-holesky.etherscan.io/api',
    rpc: {
      main: 'https://holesky.drpc.org',
    },
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.EthereumMainnet,
  }),
  [ChainId.HorizenEONMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.HorizenEONMainnet,
    name: 'Horizen EON',
    logoUrl: '/assets/images/vendor/chains/horizen.png',
    etherscanCompatibleApiUrl: 'https://eon-explorer.horizenlabs.io/api',
    rpc: {
      main: 'https://eon-rpc.horizenlabs.io/ethv1',
    },
  }),
  [ChainId.HorizenGobiTestnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.HorizenGobiTestnet,
    name: 'Horizen Gobi',
    logoUrl: '/assets/images/vendor/chains/horizen.png',
    explorerUrl: 'https://gobi-explorer.horizenlabs.io',
    etherscanCompatibleApiUrl: 'https://gobi-explorer.horizenlabs.io/api',
    isTestnet: true,
    correspondingMainnetChainId: ChainId.HorizenEONMainnet,
  }),
  [ChainId.HuobiECOChainMainnet]: new Chain({
    type: SupportType.UNSUPPORTED,
    chainId: ChainId.HuobiECOChainMainnet,
    name: 'HECO',
    logoUrl: '/assets/images/vendor/chains/heco.svg',
  }),
  [ChainId.ImmutablezkEVM]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.ImmutablezkEVM,
    name: 'Immutable zkEVM',
    logoUrl: '/assets/images/vendor/chains/immutable.svg',
    etherscanCompatibleApiUrl: 'https://explorer.immutable.com/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.InEVMMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.InEVMMainnet,
    name: 'inEVM',
    logoUrl: '/assets/images/vendor/chains/injective.svg',
    explorerUrl: 'https://explorer.inevm.com',
    etherscanCompatibleApiUrl: 'https://explorer.inevm.com/api',
  }),
  [ChainId.IOTAEVM]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.IOTAEVM,
    name: 'IOTA EVM',
    logoUrl: '/assets/images/vendor/chains/iota.svg',
    etherscanCompatibleApiUrl: 'https://explorer.evm.iota.org/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.IOTAEVMTestnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.IOTAEVMTestnet,
    name: 'IOTA EVM Testnet',
    logoUrl: '/assets/images/vendor/chains/iota.svg',
    etherscanCompatibleApiUrl: 'https://explorer.evm.testnet.iotaledger.net/api',
    isTestnet: true,
    correspondingMainnetChainId: ChainId.IOTAEVM,
  }),
  [ChainId.IoTeXNetworkMainnet]: new Chain({
    type: SupportType.UNSUPPORTED,
    chainId: ChainId.IoTeXNetworkMainnet,
    name: 'IoTeX',
    logoUrl: '/assets/images/vendor/chains/iotex.png',
  }),
  [ChainId.KardiaChainMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.KardiaChainMainnet,
    name: 'KardiaChain',
    logoUrl: '/assets/images/vendor/chains/kardiachain.svg',
    explorerUrl: 'https://explorer.kardiachain.io',
    etherscanCompatibleApiUrl: 'https://explorer.kardiachain.io/api',
  }),
  [ChainId.Kava]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Kava,
    name: 'Kava',
    logoUrl: '/assets/images/vendor/chains/kava.svg',
    etherscanCompatibleApiUrl: 'https://explorer.kavalabs.io/api',
    deployedContracts: { ...MULTICALL },
    // TODO: Potentially add Curve.fi strategy to support KAVA
  }),
  [ChainId.KCCMainnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.KCCMainnet,
    name: 'KCC',
    logoUrl: '/assets/images/vendor/chains/kcc.svg',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.KlaytnMainnetCypress]: new Chain({
    type: SupportType.UNSUPPORTED,
    chainId: ChainId.KlaytnMainnetCypress,
    name: 'Klaytn',
    logoUrl: '/assets/images/vendor/chains/klaytn.svg',
  }),
  [ChainId.Kroma]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Kroma,
    name: 'Kroma',
    logoUrl: '/assets/images/vendor/chains/kroma.svg',
    explorerUrl: 'https://kromascan.com',
    etherscanCompatibleApiUrl: 'https://api.kromascan.com/api',
  }),
  [ChainId.KromaSepolia]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.KromaSepolia,
    name: 'Kroma Sepolia',
    logoUrl: '/assets/images/vendor/chains/kroma.svg',
    explorerUrl: 'https://sepolia.kromascan.com',
    etherscanCompatibleApiUrl: 'https://api-sepolia.kromascan.com/api',
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.Kroma,
  }),
  [ChainId.LightlinkPhoenixMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.LightlinkPhoenixMainnet,
    name: 'Lightlink',
    logoUrl: '/assets/images/vendor/chains/lightlink.jpg',
    etherscanCompatibleApiUrl: 'https://phoenix.lightlink.io/api',
  }),
  [ChainId.Linea]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.Linea,
    name: 'Linea',
    logoUrl: '/assets/images/vendor/chains/linea.png',
    explorerUrl: 'https://lineascan.build',
    rpc: {
      main: `https://linea-mainnet.infura.io/v3/${INFURA_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.LineaSepolia]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.LineaSepolia,
    name: 'Linea Sepolia',
    logoUrl: '/assets/images/vendor/chains/linea.png',
    rpc: {
      main: `https://linea-sepolia.infura.io/v3/${INFURA_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.Linea,
  }),
  // [ChainId.LUKSOMainnet]: new Chain({
  //   type: SupportType.ETHERSCAN_COMPATIBLE,
  //   chainId: ChainId.LUKSOMainnet,
  //   name: 'LUKSO',
  //   logoUrl: '/assets/images/vendor/chains/lukso.svg',
  //   etherscanCompatibleApiUrl: 'https://api.explorer.execution.mainnet.lukso.network/api',
  //   deployedContracts: { ...MULTICALL },
  // }),
  // [ChainId.LUKSOTestnet]: new Chain({
  //   type: SupportType.ETHERSCAN_COMPATIBLE,
  //   chainId: ChainId.LUKSOTestnet,
  //   name: 'LUKSO Testnet',
  //   logoUrl: '/assets/images/vendor/chains/lukso.svg',
  //   etherscanCompatibleApiUrl: 'https://api.explorer.execution.testnet.lukso.network/api',
  //   deployedContracts: { ...MULTICALL },
  //   isTestnet: true,
  //   correspondingMainnetChainId: ChainId.LUKSOMainnet,
  // }),
  [ChainId.MantaPacificMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.MantaPacificMainnet,
    name: 'Manta Pacific',
    logoUrl: '/assets/images/vendor/chains/manta-pacific.svg',
    infoUrl: 'https://pacific.manta.network/',
    etherscanCompatibleApiUrl: 'https://manta-pacific.calderaexplorer.xyz/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.Mantle]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Mantle,
    name: 'Mantle',
    logoUrl: '/assets/images/vendor/chains/mantle.svg',
    etherscanCompatibleApiUrl: 'https://explorer.mantle.xyz/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.MantleSepoliaTestnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.MantleSepoliaTestnet,
    name: 'Mantle Sepolia',
    logoUrl: '/assets/images/vendor/chains/mantle.svg',
    etherscanCompatibleApiUrl: 'https://explorer.sepolia.mantle.xyz//api',
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.Mantle,
  }),
  [ChainId.MaxxChainMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.MaxxChainMainnet,
    name: 'MaxxChain',
    logoUrl: '/assets/images/vendor/chains/maxxchain.png',
    etherscanCompatibleApiUrl: 'https://explorer.maxxchain.org/api',
  }),
  [ChainId.MerlinMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.MerlinMainnet,
    name: 'Merlin',
    logoUrl: '/assets/images/vendor/chains/merlin.svg',
    explorerUrl: 'https://scan.merlinchain.io',
    etherscanCompatibleApiUrl: 'https://scan-v1.merlinchain.io/api',
    rpc: {
      main: 'https://rpc.merlinchain.io',
    },
  }),
  [ChainId.MetisAndromedaMainnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.MetisAndromedaMainnet,
    name: 'Metis',
    logoUrl: '/assets/images/vendor/chains/metis.svg',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.MilkomedaC1Mainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.MilkomedaC1Mainnet,
    name: 'Milkomeda C1',
    logoUrl: '/assets/images/vendor/chains/milkomeda.svg',
    etherscanCompatibleApiUrl: 'https://explorer-mainnet-cardano-evm.c1.milkomeda.com/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.Mode]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Mode,
    name: 'Mode',
    logoUrl: '/assets/images/vendor/chains/mode.jpg',
    etherscanCompatibleApiUrl: 'https://explorer.mode.network/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.MoonbaseAlpha]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.MoonbaseAlpha,
    name: 'Moonbase Alpha',
    logoUrl: '/assets/images/vendor/chains/moonbeam.svg',
    etherscanCompatibleApiUrl: 'https://api-moonbase.moonscan.io/api',
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.Moonbeam,
  }),
  [ChainId.Moonbeam]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Moonbeam,
    name: 'Moonbeam',
    logoUrl: '/assets/images/vendor/chains/moonbeam.svg',
    etherscanCompatibleApiUrl: 'https://api-moonbeam.moonscan.io/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.Moonriver]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Moonriver,
    name: 'Moonriver',
    logoUrl: '/assets/images/vendor/chains/moonriver.svg',
    infoUrl: 'https://moonbeam.network/networks/moonriver/',
    etherscanCompatibleApiUrl: 'https://api-moonriver.moonscan.io/api',
    deployedContracts: { ...MULTICALL },
    isCanary: true,
    correspondingMainnetChainId: ChainId.Moonbeam,
  }),
  [ChainId.Nahmii2Mainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Nahmii2Mainnet,
    name: 'Nahmii',
    logoUrl: '/assets/images/vendor/chains/nahmii.svg',
    etherscanCompatibleApiUrl: 'https://explorer.nahmii.io/api',
  }),
  [ChainId.NeonEVMMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.NeonEVMMainnet,
    name: 'Neon',
    logoUrl: '/assets/images/vendor/chains/neon.svg',
    etherscanCompatibleApiUrl: 'https://neon.blockscout.com/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.OasisEmerald]: new Chain({
    type: SupportType.COVALENT,
    chainId: ChainId.OasisEmerald,
    name: 'Oasis Emerald',
    logoUrl: '/assets/images/vendor/chains/oasis.png',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.OasisSapphire]: new Chain({
    type: SupportType.COVALENT,
    chainId: ChainId.OasisSapphire,
    name: 'Oasis Sapphire',
    logoUrl: '/assets/images/vendor/chains/oasis.png',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.OasysMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.OasysMainnet,
    name: 'Oasys',
    logoUrl: '/assets/images/vendor/chains/oasys.svg',
    explorerUrl: 'https://scan.oasys.games',
    etherscanCompatibleApiUrl: 'https://scan.oasys.games/api',
  }),
  [ChainId.OctaSpace]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.OctaSpace,
    name: 'OctaSpace',
    logoUrl: '/assets/images/vendor/chains/octaspace.png',
    etherscanCompatibleApiUrl: 'https://explorer.octa.space/api',
  }),
  [ChainId.OpBNBMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.OpBNBMainnet,
    name: 'opBNB',
    logoUrl: '/assets/images/vendor/chains/bnb-chain.svg',
    etherscanCompatibleApiUrl: 'https://api-opbnb.bscscan.com/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.OPMainnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.OPMainnet,
    name: 'Optimism',
    logoUrl: '/assets/images/vendor/chains/optimism.svg',
    rpc: {
      main: `https://optimism-mainnet.infura.io/v3/${INFURA_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
    // TODO: Look at integrating Velodrome for OP
  }),
  [ChainId.OPSepoliaTestnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.OPSepoliaTestnet,
    name: 'Optimism Sepolia',
    logoUrl: '/assets/images/vendor/chains/optimism.svg',
    rpc: {
      main: `https://optimism-sepolia.infura.io/v3/${INFURA_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.OPMainnet,
  }),
  [ChainId.Palm]: new Chain({
    type: SupportType.COVALENT,
    chainId: ChainId.Palm,
    name: 'Palm',
    logoUrl: '/assets/images/vendor/chains/palm.png',
    explorerUrl: 'https://www.ondora.xyz/network/palm',
    rpc: {
      free: 'https://palm-mainnet.public.blastapi.io',
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.PegoNetwork]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.PegoNetwork,
    name: 'Pego',
    logoUrl: '/assets/images/vendor/chains/pego.jpg',
    etherscanCompatibleApiUrl: 'https://scan.pego.network/api',
  }),
  [ChainId['PGN(PublicGoodsNetwork)']]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId['PGN(PublicGoodsNetwork)'],
    name: 'PGN',
    logoUrl: '/assets/images/vendor/chains/pgn.svg',
    etherscanCompatibleApiUrl: 'https://explorer.publicgoods.network/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.PolygonMainnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.PolygonMainnet,
    name: 'Polygon',
    logoUrl: '/assets/images/vendor/chains/polygon.svg',
    rpc: {
      main: `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      logs: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.PolygonzkEVM]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.PolygonzkEVM,
    name: 'Polygon zkEVM',
    logoUrl: '/assets/images/vendor/chains/polygon.svg',
    explorerUrl: 'https://zkevm.polygonscan.com',
    etherscanCompatibleApiUrl: 'https://api-zkevm.polygonscan.com/api',
    rpc: {
      main: `https://polygonzkevm-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.PolygonzkEVMCardonaTestnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.PolygonzkEVMCardonaTestnet,
    name: 'Polygon zkEVM Cardona',
    logoUrl: '/assets/images/vendor/chains/polygon.svg',
    explorerUrl: 'https://cardona-zkevm.polygonscan.com/',
    etherscanCompatibleApiUrl: 'https://api-cardona-zkevm.polygonscan.com/api',
    rpc: {
      main: `https://polygonzkevm-cardona.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.PolygonzkEVM,
  }),
  [ChainId.PulseChain]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.PulseChain,
    name: 'PulseChain',
    logoUrl: '/assets/images/vendor/chains/pulsechain.png',
    explorerUrl: 'https://scan.pulsechainfoundation.org',
    etherscanCompatibleApiUrl: 'https://api.scan.pulsechain.com/api',
    // Although multicall is deployed on Pulsechain, it is causing issues
    // deployedContracts: { ...MULTICALL },
  }),
  [ChainId.RARIChainMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.RARIChainMainnet,
    name: 'RARI Chain',
    logoUrl: '/assets/images/vendor/chains/rari.svg',
    infoUrl: 'https://rarichain.org/',
    explorerUrl: 'https://mainnet.explorer.rarichain.org',
    etherscanCompatibleApiUrl: 'https://mainnet.explorer.rarichain.org/api',
    rpc: {
      main: 'https://mainnet.rpc.rarichain.org/http',
    },
  }),
  [ChainId.RedlightChainMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.RedlightChainMainnet,
    name: 'Redlight',
    logoUrl: '/assets/images/vendor/chains/redlight.png',
    etherscanCompatibleApiUrl: 'https://redlightscan.finance/api',
  }),
  [ChainId.Redstone]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Redstone,
    name: 'Redstone',
    logoUrl: '/assets/images/vendor/chains/redstone.svg',
    etherscanCompatibleApiUrl: 'https://explorer.redstone.xyz/api',
    // deployedContracts: { ...MULTICALL },
  }),
  [ChainId.RolluxMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.RolluxMainnet,
    name: 'Rollux',
    logoUrl: '/assets/images/vendor/chains/rollux.svg',
    etherscanCompatibleApiUrl: 'https://explorer.rollux.com/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.RootstockMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.RootstockMainnet,
    name: 'Rootstock',
    logoUrl: '/assets/images/vendor/chains/rootstock.jpg',
    etherscanCompatibleApiUrl: 'https://blockscout.com/rsk/mainnet/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.RSS3VSLMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.RSS3VSLMainnet,
    name: 'RSS3 VSL',
    logoUrl: '/assets/images/vendor/chains/rss3.svg',
    etherscanCompatibleApiUrl: 'https://scan.rss3.io/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.RSS3VSLSepoliaTestnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.RSS3VSLSepoliaTestnet,
    name: 'RSS3 VSL Sepolia',
    logoUrl: '/assets/images/vendor/chains/rss3.svg',
    etherscanCompatibleApiUrl: 'https://scan.testnet.rss3.io/api',
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.RSS3VSLMainnet,
  }),
  [ChainId.Scroll]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Scroll,
    name: 'Scroll',
    logoUrl: '/assets/images/vendor/chains/scroll.svg',
    explorerUrl: 'https://scrollscan.com',
    etherscanCompatibleApiUrl: 'https://api.scrollscan.com/api', // TODO
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.ScrollSepoliaTestnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.ScrollSepoliaTestnet,
    name: 'Scroll Sepolia',
    logoUrl: '/assets/images/vendor/chains/scroll.svg',
    etherscanCompatibleApiUrl: 'https://api-sepolia.scrollscan.com/api',
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.Scroll,
  }),
  [ChainId.Sepolia]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.Sepolia,
    name: 'Ethereum Sepolia',
    logoUrl: '/assets/images/vendor/chains/ethereum.svg',
    rpc: {
      main: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.EthereumMainnet,
  }),
  [ChainId.Shibarium]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.Shibarium,
    name: 'Shibarium',
    logoUrl: '/assets/images/vendor/chains/shibarium.svg',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.Shiden]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Shiden,
    name: 'Shiden',
    logoUrl: '/assets/images/vendor/chains/shiden.svg',
    infoUrl: 'https://shiden.astar.network',
    etherscanCompatibleApiUrl: 'https://blockscout.com/shiden/api',
    rpc: {
      main: 'https://shiden.public.blastapi.io',
    },
    isCanary: true,
    correspondingMainnetChainId: ChainId.Astar,
  }),
  [ChainId.ShimmerEVM]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.ShimmerEVM,
    name: 'Shimmer',
    logoUrl: '/assets/images/vendor/chains/shimmer.svg',
    etherscanCompatibleApiUrl: 'https://explorer.evm.shimmer.network/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.ShimmerEVMTestnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.ShimmerEVMTestnet,
    name: 'Shimmer Testnet',
    logoUrl: '/assets/images/vendor/chains/shimmer.svg',
    etherscanCompatibleApiUrl: 'https://explorer.evm.testnet.shimmer.network/api',
    isTestnet: true,
    correspondingMainnetChainId: ChainId.ShimmerEVM,
  }),
  [ChainId['SongbirdCanary-Network']]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId['SongbirdCanary-Network'],
    name: 'Songbird',
    logoUrl: '/assets/images/vendor/chains/songbird.svg',
    infoUrl: 'https://flare.network/songbird',
    etherscanCompatibleApiUrl: 'https://songbird-explorer.flare.network/api',
    deployedContracts: { ...MULTICALL },
    isCanary: true,
    correspondingMainnetChainId: ChainId.FlareMainnet,
  }),
  [ChainId.SyscoinMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.SyscoinMainnet,
    name: 'Syscoin',
    logoUrl: '/assets/images/vendor/chains/syscoin.svg',
    etherscanCompatibleApiUrl: 'https://explorer.syscoin.org/api',
    rpc: {
      main: 'https://syscoin.public-rpc.com',
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.SyscoinTanenbaumTestnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.SyscoinTanenbaumTestnet,
    name: 'Syscoin Tanenbaum',
    logoUrl: '/assets/images/vendor/chains/syscoin.svg',
    etherscanCompatibleApiUrl: 'https://tanenbaum.io/api',
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.SyscoinMainnet,
  }),
  [ChainId.TabiTestnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.TabiTestnet,
    name: 'Tabi Testnet',
    logoUrl: '/assets/images/vendor/chains/tabi.svg',
    infoUrl: 'https://www.tabichain.com',
    explorerUrl: 'https://testnet.tabiscan.com',
    etherscanCompatibleApiUrl: 'https://testnet-api2.tabiscan.com/api',
    rpc: {
      main: 'https://rpc.testnet.tabichain.com',
    },
    nativeToken: 'TABI',
    isTestnet: true,
    correspondingMainnetChainId: 12345678905, // TODO: This is a placeholder so we can add a description for Tabi
  }),
  [ChainId.TaikoHeklaL2]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.TaikoHeklaL2,
    name: 'Taiko Hekla',
    logoUrl: '/assets/images/vendor/chains/taiko.svg',
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: 12345678901, // TODO: This is a placeholder so we can add a description for Taiko
  }),
  [ChainId.TelosEVMMainnet]: new Chain({
    type: SupportType.UNSUPPORTED,
    chainId: ChainId.TelosEVMMainnet,
    name: 'Telos',
    logoUrl: '/assets/images/vendor/chains/telos.png',
  }),
  [ChainId.VelasEVMMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.VelasEVMMainnet,
    name: 'Velas',
    logoUrl: '/assets/images/vendor/chains/velas.svg',
    etherscanCompatibleApiUrl: 'https://evmexplorer.velas.com/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.Viction]: new Chain({
    type: SupportType.COVALENT,
    chainId: ChainId.Viction,
    name: 'Viction',
    logoUrl: '/assets/images/vendor/chains/viction.svg',
    explorerUrl: 'https://www.vicscan.xyz',
  }),
  [ChainId.Wanchain]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.Wanchain,
    name: 'Wanchain',
    logoUrl: '/assets/images/vendor/chains/wanchain.svg',
    infoUrl: 'https://www.wanchain.org',
    explorerUrl: 'https://www.wanscan.org',
    deployedContracts: {
      multicall3: { address: '0xcDF6A1566e78EB4594c86Fe73Fcdc82429e97fbB' },
    },
  }),
  [ChainId['WEMIX3.0Mainnet']]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId['WEMIX3.0Mainnet'],
    name: 'WEMIX',
    logoUrl: '/assets/images/vendor/chains/wemix.svg',
    etherscanCompatibleApiUrl: 'https://api.wemixscan.com/api',
  }),
  [ChainId.XDCNetwork]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.XDCNetwork,
    name: 'XDC',
    logoUrl: '/assets/images/vendor/chains/xdc.svg',
    infoUrl: 'https://xdc.org',
    rpc: {
      main: 'https://erpc.xdcrpc.com',
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.XLayerMainnet]: new Chain({
    type: SupportType.COVALENT,
    chainId: ChainId.XLayerMainnet,
    name: 'X Layer',
    logoUrl: '/assets/images/vendor/chains/xlayer.svg',
  }),
  [ChainId.ZetaChainAthens3Testnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.ZetaChainAthens3Testnet,
    name: 'ZetaChain Athens',
    logoUrl: '/assets/images/vendor/chains/zetachain.svg',
    explorerUrl: 'https://zetachain-athens-3.blockscout.com',
    etherscanCompatibleApiUrl: 'https://zetachain-athens-3.blockscout.com/api',
    rpc: {
      main: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
    },
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.ZetaChainMainnet,
  }),
  [ChainId.ZetaChainMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.ZetaChainMainnet,
    name: 'ZetaChain',
    logoUrl: '/assets/images/vendor/chains/zetachain.svg',
    explorerUrl: 'https://zetachain.blockscout.com',
    etherscanCompatibleApiUrl: 'https://zetachain.blockscout.com/api',
    rpc: {
      main: 'https://zetachain-evm.blockpi.network/v1/rpc/public',
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.ZKFairMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.ZKFairMainnet,
    name: 'ZKFair',
    logoUrl: '/assets/images/vendor/chains/zkfair.svg',
    etherscanCompatibleApiUrl: 'https://scan.zkfair.io/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.ZkLinkNovaMainnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.ZkLinkNovaMainnet,
    name: 'zkLink Nova',
    logoUrl: '/assets/images/vendor/chains/zklink.png',
  }),
  [ChainId.ZkSyncMainnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.ZkSyncMainnet,
    name: 'zkSync Era',
    logoUrl: '/assets/images/vendor/chains/zksync.jpeg',
    explorerUrl: 'https://era.zksync.network',
    etherscanCompatibleApiUrl: 'https://api-era.zksync.network/api',
    rpc: {
      main: `https://zksync-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
    deployedContracts: {
      multicall3: { address: '0xF9cda624FBC7e059355ce98a31693d299FACd963' },
    },
  }),
  [ChainId.ZkSyncSepoliaTestnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.ZkSyncSepoliaTestnet,
    name: 'zkSync Sepolia',
    logoUrl: '/assets/images/vendor/chains/zksync.jpeg',
    explorerUrl: 'https://sepolia-era.zksync.network',
    etherscanCompatibleApiUrl: 'https://api-sepolia-era.zksync.network/api',
    rpc: {
      main: `https://zksync-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
    deployedContracts: {
      multicall3: { address: '0xF9cda624FBC7e059355ce98a31693d299FACd963' },
    },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.ZkSyncMainnet,
  }),
  [ChainId.Zora]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Zora,
    name: 'Zora',
    logoUrl: '/assets/images/vendor/chains/zora.svg',
    etherscanCompatibleApiUrl: 'https://explorer.zora.energy/api',
    deployedContracts: { ...MULTICALL },
  }),
  // TODO: This is a placeholder so we can add a description for Taiko
  [12345678901]: new Chain({
    type: SupportType.UNSUPPORTED,
    chainId: 12345678901,
    name: 'Taiko',
  }),
  // TODO: This is a placeholder so we can add a description for Frame
  [12345678902]: new Chain({
    type: SupportType.UNSUPPORTED,
    chainId: 12345678902,
    name: 'Frame',
  }),
  // TODO: This is a placeholder so we can add a description for Berachain
  [12345678903]: new Chain({
    type: SupportType.UNSUPPORTED,
    chainId: 12345678903,
    name: 'Berachain',
  }),
  // TODO: This is a placeholder so we can add a description for Tabi
  [12345678905]: new Chain({
    type: SupportType.UNSUPPORTED,
    chainId: 12345678905,
    name: 'Tabi',
  }),
};

export const SUPPORTED_CHAINS = Object.values(CHAINS)
  .filter((chain) => chain.isSupported())
  .map((chain) => chain.chainId);

export const ETHERSCAN_SUPPORTED_CHAINS = Object.values(CHAINS)
  .filter((chain) => chain.type === SupportType.ETHERSCAN_COMPATIBLE)
  .map((chain) => chain.chainId);

export const getChainConfig = (chainId: number): Chain | undefined => {
  return CHAINS[chainId] ?? new Chain({ chainId, type: SupportType.PROVIDER }); // Add a fallback for unknown chains so that we don't break the app
};

// TODO: All these functions below are kept for backwards compatibility and should be removed in the future in favor of getChainConfig

export const isCovalentSupportedChain = (chainId: number): boolean => {
  return getChainConfig(chainId)?.type === SupportType.COVALENT;
};

export const isEtherscanSupportedChain = (chainId: number): boolean => {
  return getChainConfig(chainId)?.type === SupportType.ETHERSCAN_COMPATIBLE;
};

export const isNodeSupportedChain = (chainId: number): boolean => {
  return getChainConfig(chainId)?.type === SupportType.BACKEND_NODE;
};

export const getChainName = (chainId: number): string | undefined => {
  return getChainConfig(chainId)?.getName();
};

export const getChainSlug = (chainId: number): string | undefined => {
  return getChainConfig(chainId)?.getSlug();
};

const REVERSE_CHAIN_SLUGS: Record<string, number> = Object.fromEntries(
  SUPPORTED_CHAINS.map((chainId) => [getChainSlug(chainId), chainId])
);

export const getChainIdFromSlug = (slug: string): number | undefined => {
  return REVERSE_CHAIN_SLUGS[slug];
};

export const getChainExplorerUrl = (chainId: number): string | undefined => {
  return getChainConfig(chainId)?.getExplorerUrl();
};

// This is used on the "Add a network" page
export const getChainFreeRpcUrl = (chainId: number): string | undefined => {
  return getChainConfig(chainId)?.getFreeRpcUrl();
};

export const getChainRpcUrl = (chainId: number): string | undefined => {
  return getChainConfig(chainId)?.getRpcUrl();
};

export const getChainRpcUrls = (chainId: number): string[] | undefined => {
  return getChainConfig(chainId)?.getRpcUrls();
};

export const getChainLogsRpcUrl = (chainId: number): string | undefined => {
  return getChainConfig(chainId)?.getLogsRpcUrl();
};

export const getChainLogo = (chainId: number): string | undefined => {
  return getChainConfig(chainId)?.getLogoUrl();
};

export const getChainInfoUrl = (chainId: number): string | undefined => {
  return getChainConfig(chainId)?.getInfoUrl();
};

export const getChainNativeToken = (chainId: number): string | undefined => {
  return getChainConfig(chainId)?.getNativeToken();
};

export const getCorrespondingMainnetChainId = (chainId: number): number | undefined => {
  return getChainConfig(chainId)?.getCorrespondingMainnetChainId();
};

export const getChainDeployedContracts = (chainId: number): any | undefined => {
  return getChainConfig(chainId)?.getDeployedContracts();
};

export const getViemChainConfig = (chainId: number): ViemChain | undefined => {
  return getChainConfig(chainId)?.getViemChainConfig();
};

export const createViemPublicClientForChain = (chainId: number, url?: string): PublicClient | undefined => {
  return getChainConfig(chainId)?.createViemPublicClient(url);
};
