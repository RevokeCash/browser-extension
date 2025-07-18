import { ChainId } from '@revoke.cash/chains';
import { ALCHEMY_API_KEY, INFURA_API_KEY } from '../constants';
import { type PublicClient, type Chain as ViemChain, toHex } from 'viem';
import { Chain, type DeployedContracts, SupportType } from '../chains/Chain';

const MULTICALL = {
  multicall3: {
    address: '0xcA11bde05977b3631167028862bE2a173976CA11' as const,
  },
};

export const CHAINS = {
  [ChainId.Abstract]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.Abstract,
    name: 'Abstract',
    nativeToken: 'ETH',
    logoUrl: '/assets/images/vendor/chains/abstract.jpg',
    explorerUrl: 'https://abscan.org',
    rpc: {
      main: `https://abstract-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      free: 'https://api.mainnet.abs.xyz',
    },
    deployedContracts: { multicall3: { address: '0xAa4De41dba0Ca5dCBb288b7cC6b708F3aaC759E7' } },
  }),
  [ChainId.AbstractSepoliaTestnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.AbstractSepoliaTestnet,
    name: 'Abstract Testnet',
    nativeToken: 'ETH',
    logoUrl: '/assets/images/vendor/chains/abstract.jpg',
    explorerUrl: 'https://sepolia.abscan.org',
    rpc: {
      main: `https://abstract-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
    deployedContracts: { multicall3: { address: '0xF9cda624FBC7e059355ce98a31693d299FACd963' } },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.Abstract,
  }),
  [ChainId.Amoy]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.Amoy,
    name: 'Polygon Amoy',
    nativeToken: 'POL',
    logoUrl: '/assets/images/vendor/chains/polygon.svg',
    rpc: {
      main: `https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.PolygonMainnet,
  }),
  [ChainId.ApeChain]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.ApeChain,
    name: 'ApeChain',
    nativeToken: 'APE',
    logoUrl: '/assets/images/vendor/chains/apechain.svg',
    explorerUrl: 'https://apescan.io',
    infoUrl: 'https://apechain.com',
    etherscanCompatibleApiUrl: 'https://api.apescan.io/api',
    rpc: {
      main: `https://apechain-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      free: 'https://apechain.calderachain.xyz/http',
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.ArbitrumNova]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.ArbitrumNova,
    name: 'Arbitrum Nova',
    logoUrl: '/assets/images/vendor/chains/arbitrum-nova.svg',
    explorerUrl: 'https://nova.arbiscan.io',
    etherscanCompatibleApiUrl: 'https://api-nova.arbiscan.io/api',
    rpc: {
      main: `https://arbnova-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.ArbitrumOne]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.ArbitrumOne,
    name: 'Arbitrum',
    logoUrl: '/assets/images/vendor/chains/arbitrum.svg',
    explorerUrl: 'https://arbiscan.io',
    rpc: {
      main: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      free: 'https://arb1.arbitrum.io/rpc',
    },
    deployedContracts: { ...MULTICALL },
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
  [ChainId.Berachain]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Berachain,
    name: 'Berachain',
    logoUrl: '/assets/images/vendor/chains/berachain.svg',
    explorerUrl: 'https://berascan.com',
    etherscanCompatibleApiUrl: 'https://api.berascan.com/api',
    rpc: {
      main: `https://berachain-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.BerachainbArtio]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.BerachainbArtio,
    name: 'Berachain bArtio',
    logoUrl: '/assets/images/vendor/chains/berachain.svg',
    etherscanCompatibleApiUrl: 'https://api.routescan.io/v2/network/testnet/evm/80084/etherscan/api',
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.Berachain,
  }),
  [ChainId.BitgertMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.BitgertMainnet,
    name: 'Bitgert',
    logoUrl: '/assets/images/vendor/chains/bitgert.svg',
    etherscanCompatibleApiUrl: 'https://brisescan.com/api',
    nativeToken: 'BRISE',
    rpc: {
      main: 'https://mainnet-rpc.brisescan.com',
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.BitlayerMainnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.BitlayerMainnet,
    name: 'Bitlayer',
    logoUrl: '/assets/images/vendor/chains/bitlayer.png',
    rpc: {
      main: 'https://rpc.bitlayer.org',
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.BitrockMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.BitrockMainnet,
    name: 'Bitrock',
    logoUrl: '/assets/images/vendor/chains/bitrock.svg',
    etherscanCompatibleApiUrl: 'http://explorer.bit-rock.io/api',
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
      main: `https://blast-mainnet.infura.io/v3/${INFURA_API_KEY}`,
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
      main: `https://blast-sepolia.infura.io/v3/${INFURA_API_KEY}`,
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
    rpc: {
      main: `https://bnb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.BNBSmartChainTestnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.BNBSmartChainTestnet,
    name: 'BNB Chain Testnet',
    logoUrl: '/assets/images/vendor/chains/bnb-chain.svg',
    rpc: {
      main: `https://bnb-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
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
    deployedContracts: { ...MULTICALL },
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
    explorerUrl: 'https://explorer.callistodao.org',
    etherscanCompatibleApiUrl: 'https://explorer.callistodao.org/api',
    rpc: {
      main: 'https://rpc.callistodao.org',
      free: 'https://rpc.callistodao.org',
    },
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
      // main: `https://celo-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY} `,
      main: `https://celo-mainnet.infura.io/v3/${INFURA_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.ChilizChainMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.ChilizChainMainnet,
    name: 'Chiliz',
    logoUrl: '/assets/images/vendor/chains/chiliz.png',
    etherscanCompatibleApiUrl: 'https://scan.chiliz.com/api',
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
    etherscanCompatibleApiUrl: 'https://crab-scan.darwinia.network/api',
    rpc: {
      main: 'https://crab-rpc.darwinia.network',
    },
    deployedContracts: { ...MULTICALL },
    isCanary: true,
    correspondingMainnetChainId: ChainId.DarwiniaNetwork,
  }),
  [ChainId.CreatorChainTestnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.CreatorChainTestnet,
    name: 'Creator Chain Testnet',
    logoUrl: '/assets/images/vendor/chains/creator-chain.png',
    etherscanCompatibleApiUrl: 'https://explorer.creatorchain.io/api',
    // deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: 12345678902,
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
    etherscanCompatibleApiUrl: 'https://explorer.darwinia.network/api',
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
      // main: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      main: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      free: 'https://eth.llamarpc.com',
    },
    deployedContracts: {
      ...MULTICALL,
      ensRegistry: { address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' },
      ensUniversalResolver: { address: '0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62' },
    },
  }),
  [ChainId.Ethernity]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Ethernity,
    name: 'Ethernity',
    logoUrl: '/assets/images/vendor/chains/ethernity.png',
    etherscanCompatibleApiUrl: 'https://api.routescan.io/v2/network/mainnet/evm/183/etherscan/api',
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
    rpc: {
      main: `https://fantom-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.FantomTestnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.FantomTestnet,
    name: 'Fantom Testnet',
    logoUrl: '/assets/images/vendor/chains/fantom.svg',
    etherscanCompatibleApiUrl: 'https://api-testnet.ftmscan.com/api',
    rpc: {
      main: `https://fantom-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
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
  [ChainId.GeistMainnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.GeistMainnet,
    name: 'Geist',
    logoUrl: '/assets/images/vendor/chains/geist.png',
    explorerUrl: 'https://geist-mainnet.explorer.alchemy.com/',
    rpc: {
      main: `https://geist-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      free: 'https://geist-mainnet.g.alchemy.com/public',
    },
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
    rpc: {
      main: `https://gnosis-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
  }),
  [ChainId.GoldXChainMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.GoldXChainMainnet,
    name: 'GoldX',
    logoUrl: '/assets/images/vendor/chains/goldx.jpg',
    etherscanCompatibleApiUrl: 'https://explorer.goldxchain.io/api',
  }),
  [ChainId.GravityAlphaMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.GravityAlphaMainnet,
    name: 'Gravity Alpha',
    logoUrl: '/assets/images/vendor/chains/gravity.svg',
    etherscanCompatibleApiUrl: 'https://explorer-gravity-mainnet-0.t.conduit.xyz/api',
  }),
  [ChainId.HarmonyMainnetShard0]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.HarmonyMainnetShard0,
    name: 'Harmony',
    logoUrl: '/assets/images/vendor/chains/harmony.svg',
    etherscanCompatibleApiUrl: 'https://explorer.harmony.one/api',
    deployedContracts: { ...MULTICALL },
    rpc: {
      main: 'https://api.harmony.one',
    },
  }),
  [ChainId.Holesky]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.Holesky,
    name: 'Ethereum Holesky',
    logoUrl: '/assets/images/vendor/chains/ethereum.svg',
    rpc: {
      main: `https://eth-holesky.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      free: 'https://holesky.drpc.org',
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
    etherscanCompatibleApiUrl: 'https://eon-explorer-api.horizenlabs.io/api',
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
    etherscanCompatibleApiUrl: 'https://gobi-explorer-api.horizenlabs.io/api',
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
  [ChainId.Ink]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.Ink,
    name: 'Ink',
    logoUrl: '/assets/images/vendor/chains/ink.svg',
    rpc: {
      main: `https://ink-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
    // deployedContracts: { ...MULTICALL },
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
  [ChainId.KaiaMainnet]: new Chain({
    type: SupportType.UNSUPPORTED,
    chainId: ChainId.KaiaMainnet,
    name: 'Kaia',
    logoUrl: '/assets/images/vendor/chains/kaia.svg',
  }),
  [ChainId.KardiaChainMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.KardiaChainMainnet,
    name: 'KardiaChain',
    logoUrl: '/assets/images/vendor/chains/kardiachain.svg',
    explorerUrl: 'https://explorer.kardiachain.io',
    etherscanCompatibleApiUrl: 'https://explorer.kardiachain.io/api',
  }),
  [ChainId.KCCMainnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.KCCMainnet,
    name: 'KCC',
    logoUrl: '/assets/images/vendor/chains/kcc.svg',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.Kroma]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Kroma,
    name: 'Kroma',
    logoUrl: '/assets/images/vendor/chains/kroma.svg',
    explorerUrl: 'https://blockscout.kroma.network',
    etherscanCompatibleApiUrl: 'https://blockscout.kroma.network/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.KromaSepolia]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.KromaSepolia,
    name: 'Kroma Sepolia',
    logoUrl: '/assets/images/vendor/chains/kroma.svg',
    explorerUrl: 'https://blockscout.sepolia.kroma.network/',
    etherscanCompatibleApiUrl: 'https://blockscout.sepolia.kroma.network/api',
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
      // main: `https://linea-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
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
  [ChainId.Lisk]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Lisk,
    name: 'Lisk',
    etherscanCompatibleApiUrl: 'https://blockscout.lisk.com/api',
    logoUrl: '/assets/images/vendor/chains/lisk.svg',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.MantaPacificMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.MantaPacificMainnet,
    name: 'Manta Pacific',
    logoUrl: '/assets/images/vendor/chains/manta-pacific.svg',
    infoUrl: 'https://pacific.manta.network/',
    etherscanCompatibleApiUrl: 'https://manta-pacific.calderaexplorer.xyz/api',
    rpc: {
      main: 'https://manta-pacific.drpc.org',
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.Mantle]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Mantle,
    name: 'Mantle',
    logoUrl: '/assets/images/vendor/chains/mantle.svg',
    etherscanCompatibleApiUrl: 'https://explorer.mantle.xyz/api',
    rpc: {
      main: `https://mantle-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.MantleSepoliaTestnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.MantleSepoliaTestnet,
    name: 'Mantle Sepolia',
    logoUrl: '/assets/images/vendor/chains/mantle.svg',
    etherscanCompatibleApiUrl: 'https://explorer.sepolia.mantle.xyz/api',
    rpc: {
      main: `https://mantle-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
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
    type: SupportType.COVALENT,
    chainId: ChainId.MerlinMainnet,
    name: 'Merlin',
    logoUrl: '/assets/images/vendor/chains/merlin.svg',
    explorerUrl: 'https://scan.merlinchain.io',
    rpc: {
      main: 'https://rpc.merlinchain.io',
    },
  }),
  [ChainId.MetisAndromedaMainnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.MetisAndromedaMainnet,
    name: 'Metis',
    logoUrl: '/assets/images/vendor/chains/metis.svg',
    rpc: {
      main: `https://metis-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
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
  [ChainId.MintMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.MintMainnet,
    name: 'Mint',
    logoUrl: '/assets/images/vendor/chains/mint.svg',
    etherscanCompatibleApiUrl: 'https://explorer.mintchain.io/api',
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
  [ChainId.Morph]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Morph,
    name: 'Morph',
    logoUrl: '/assets/images/vendor/chains/morph.svg',
    etherscanCompatibleApiUrl: 'https://explorer-api.morphl2.io/api',
    rpc: {
      main: 'https://rpc.morphl2.io',
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.MorphHolesky]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.MorphHolesky,
    name: 'Morph Holesky',
    logoUrl: '/assets/images/vendor/chains/morph.svg',
    etherscanCompatibleApiUrl: 'https://explorer-api-holesky.morphl2.io/api',
    rpc: {
      main: 'https://rpc-holesky.morphl2.io',
    },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.Morph,
  }),
  [ChainId.Nahmii3Mainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Nahmii3Mainnet,
    name: 'Nahmii',
    logoUrl: '/assets/images/vendor/chains/nahmii.svg',
    etherscanCompatibleApiUrl: 'https://backend.explorer.n3.nahmii.io/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.NeonEVMMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.NeonEVMMainnet,
    name: 'Neon',
    logoUrl: '/assets/images/vendor/chains/neon.svg',
    etherscanCompatibleApiUrl: 'https://neon.blockscout.com/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.NeoXMainnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.NeoXMainnet,
    name: 'Neo X',
    infoUrl: 'https://x.neo.org',
    logoUrl: '/assets/images/vendor/chains/neo-x.svg',
    etherscanCompatibleApiUrl: 'https://xexplorer.neo.org/api',
    rpc: {
      main: 'https://mainnet-1.rpc.banelabs.org',
      free: 'https://mainnet-2.rpc.banelabs.org',
    },
  }),
  [ChainId.NeoXTestnetT4]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.NeoXTestnetT4,
    name: 'Neo X Testnet T4',
    infoUrl: 'https://x.neo.org',
    logoUrl: '/assets/images/vendor/chains/neo-x.svg',
    etherscanCompatibleApiUrl: 'https://xt4scan.ngd.network/api',
    rpc: {
      main: 'https://testnet.rpc.banelabs.org',
      free: 'https://testnet.rpc.banelabs.org',
    },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.NeoXMainnet,
  }),
  // [ChainId.NumbersMainnet]: new Chain({
  //   type: SupportType.ETHERSCAN_COMPATIBLE,
  //   chainId: ChainId.NumbersMainnet,
  //   name: 'Numbers',
  //   // logoUrl: '/assets/images/vendor/chains/numbers.png',
  //   etherscanCompatibleApiUrl: 'https://mainnet.num.network/api',
  // }),
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
    rpc: {
      main: `https://opbnb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.OPMainnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.OPMainnet,
    name: 'Optimism',
    logoUrl: '/assets/images/vendor/chains/optimism.svg',
    rpc: {
      // main: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      main: `https://optimism-mainnet.infura.io/v3/${INFURA_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
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
  [ChainId.PolygonMainnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.PolygonMainnet,
    name: 'Polygon',
    logoUrl: '/assets/images/vendor/chains/polygon.svg',
    rpc: {
      main: `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      // main: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
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
    explorerUrl: 'https://scan.pulsechainfoundation.org/#',
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
  [ChainId['Re.al']]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId['Re.al'],
    name: 'Re.al',
    logoUrl: '/assets/images/vendor/chains/re-al.svg',
    etherscanCompatibleApiUrl: 'https://explorer.re.al/api',
    deployedContracts: { ...MULTICALL },
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
    type: SupportType.PROVIDER,
    chainId: ChainId.RolluxMainnet,
    name: 'Rollux',
    logoUrl: '/assets/images/vendor/chains/rollux.svg',
    etherscanCompatibleApiUrl: 'https://explorer.rollux.com/api',
    rpc: {
      main: 'https://rpc.ankr.com/rollux',
      logs: 'https://rpc.rollux.com',
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.RootstockMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.RootstockMainnet,
    name: 'Rootstock',
    logoUrl: '/assets/images/vendor/chains/rootstock.jpg',
    explorerUrl: 'https://rootstock.blockscout.com',
    etherscanCompatibleApiUrl: 'https://rootstock.blockscout.com/api',
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
  [ChainId.Sanko]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Sanko,
    name: 'Sanko',
    logoUrl: '/assets/images/vendor/chains/sanko.webp',
    etherscanCompatibleApiUrl: 'https://explorer.sanko.xyz/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.Scroll]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Scroll,
    name: 'Scroll',
    logoUrl: '/assets/images/vendor/chains/scroll.svg',
    explorerUrl: 'https://scrollscan.com',
    etherscanCompatibleApiUrl: 'https://api.scrollscan.com/api',
    rpc: {
      main: `https://scroll-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
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
  [ChainId.SeiNetwork]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.SeiNetwork,
    name: 'Sei',
    logoUrl: '/assets/images/vendor/chains/sei.svg',
    etherscanCompatibleApiUrl: 'https://seitrace.com/pacific-1/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.EthereumSepolia]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.EthereumSepolia,
    name: 'Ethereum Sepolia',
    logoUrl: '/assets/images/vendor/chains/ethereum.svg',
    rpc: {
      main: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      free: 'https://sepolia.drpc.org',
    },
    deployedContracts: { ...MULTICALL },
    isTestnet: true,
    correspondingMainnetChainId: ChainId.EthereumMainnet,
  }),
  [ChainId.Shape]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.Shape,
    name: 'Shape',
    logoUrl: '/assets/images/vendor/chains/shape.svg',
    rpc: {
      main: `https://shape-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.Shibarium]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Shibarium,
    name: 'Shibarium',
    logoUrl: '/assets/images/vendor/chains/shibarium.svg',
    etherscanCompatibleApiUrl: 'https://www.shibariumscan.io/api',
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
  [ChainId.Soneium]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.Soneium,
    name: 'Soneium',
    explorerUrl: 'https://soneium.blockscout.com',
    rpc: {
      main: `https://soneium-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      free: 'https://rpc.soneium.org',
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.SonicMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.SonicMainnet,
    name: 'Sonic',
    explorerUrl: 'https://sonicscan.org',
    logoUrl: '/assets/images/vendor/chains/sonic.svg',
    etherscanCompatibleApiUrl: 'https://api.sonicscan.org/api',
    rpc: {
      main: `https://sonic-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
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
  [ChainId.StoryOdysseyTestnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.StoryOdysseyTestnet,
    name: 'Story Odyssey',
    logoUrl: '/assets/images/vendor/chains/story.svg',
    etherscanCompatibleApiUrl: 'https://odyssey.storyscan.xyz/api',
    isTestnet: true,
    correspondingMainnetChainId: 12345678901,
  }),
  [ChainId.SyscoinMainnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.SyscoinMainnet,
    name: 'Syscoin',
    logoUrl: '/assets/images/vendor/chains/syscoin.svg',
    etherscanCompatibleApiUrl: 'https://explorer.syscoin.org/api',
    rpc: {
      main: 'https://rpc.syscoin.org',
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
  [ChainId.TaikoAlethia]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.TaikoAlethia,
    name: 'Taiko Alethia',
    logoUrl: '/assets/images/vendor/chains/taiko.svg',
    explorerUrl: 'https://taikoscan.io',
    etherscanCompatibleApiUrl: 'https://api.taikoscan.io/api',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.TelosEVMMainnet]: new Chain({
    type: SupportType.UNSUPPORTED,
    chainId: ChainId.TelosEVMMainnet,
    name: 'Telos',
    logoUrl: '/assets/images/vendor/chains/telos.png',
  }),
  [ChainId.Vana]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.Vana,
    name: 'Vana',
    logoUrl: '/assets/images/vendor/chains/vana.png',
    etherscanCompatibleApiUrl: 'https://api.vanascan.io/api',
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
    deployedContracts: { ...MULTICALL },
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
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.WorldChain]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.WorldChain,
    name: 'World Chain',
    logoUrl: '/assets/images/vendor/chains/worldchain.svg',
    explorerUrl: 'https://worldchain-mainnet.explorer.alchemy.com',
    rpc: {
      main: `https://worldchain-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.XLayerMainnet]: new Chain({
    type: SupportType.COVALENT,
    chainId: ChainId.XLayerMainnet,
    name: 'X Layer',
    logoUrl: '/assets/images/vendor/chains/xlayer.svg',
    deployedContracts: { ...MULTICALL },
  }),
  [ChainId.ZERONetwork]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.ZERONetwork,
    name: 'ZERϴ',
    logoUrl: '/assets/images/vendor/chains/zero.svg',
  }),
  [ChainId.ZetaChainTestnet]: new Chain({
    type: SupportType.ETHERSCAN_COMPATIBLE,
    chainId: ChainId.ZetaChainTestnet,
    name: 'ZetaChain Testnet',
    logoUrl: '/assets/images/vendor/chains/zetachain.svg',
    explorerUrl: 'https://zetachain-athens-3.blockscout.com',
    etherscanCompatibleApiUrl: 'https://zetachain-athens-3.blockscout.com/api',
    rpc: {
      main: 'https://zeta-chain-testnet.drpc.org',
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
  [ChainId.ZircuitMainnet]: new Chain({
    type: SupportType.PROVIDER,
    chainId: ChainId.ZircuitMainnet,
    name: 'Zircuit',
    logoUrl: '/assets/images/vendor/chains/zircuit.svg',
    rpc: {
      main: 'https://zircuit-mainnet.drpc.org',
    },
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
    rpc: {
      main: `https://zora-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    },
  }),
  // TODO: This is a placeholder so we can add a description for Story
  [12345678901]: new Chain({
    type: SupportType.UNSUPPORTED,
    chainId: 12345678901,
    name: 'Story',
  }),
  // TODO: This is a placeholder so we can add a description for Story
  [12345678902]: new Chain({
    type: SupportType.UNSUPPORTED,
    chainId: 12345678902,
    name: 'Creator Chain',
  }),
  // TODO: This is a placeholder so we can add a description for Tabi
  [12345678905]: new Chain({
    type: SupportType.UNSUPPORTED,
    chainId: 12345678905,
    name: 'Tabi',
  }),
} as const;

export const SUPPORTED_CHAINS = Object.values(CHAINS)
  .filter((chain) => chain.isSupported())
  .map((chain) => chain.chainId);

export const ETHERSCAN_SUPPORTED_CHAINS = Object.values(CHAINS)
  .filter((chain) => chain.type === SupportType.ETHERSCAN_COMPATIBLE)
  .map((chain) => chain.chainId);

export type DocumentedChainId = keyof typeof CHAINS;

export const getChainConfig = (chainId: DocumentedChainId): Chain => {
  return (
    CHAINS[chainId] ??
    new Chain({
      type: SupportType.PROVIDER,
      chainId: chainId,
    })
  );
};

// TODO: All these functions below are kept for backwards compatibility and should be removed in the future in favor of getChainConfig

export const isMainnetChain = (chainId: DocumentedChainId): boolean => {
  return !isTestnetChain(chainId);
};

export const isTestnetChain = (chainId: DocumentedChainId): boolean => {
  return getChainConfig(chainId)?.isTestnet();
};

export const getChainName = (chainId: DocumentedChainId): string => {
  return getChainConfig(chainId)?.getName();
};

export const getChainExplorerUrl = (chainId: DocumentedChainId): string => {
  return getChainConfig(chainId)?.getExplorerUrl();
};

// This is used on the "Add a network" page
export const getChainFreeRpcUrl = (chainId: DocumentedChainId): string => {
  return getChainConfig(chainId)?.getFreeRpcUrl();
};

export const getChainRpcUrl = (chainId: DocumentedChainId): string => {
  return getChainConfig(chainId)?.getRpcUrl();
};

export const getChainRpcUrls = (chainId: DocumentedChainId): string[] => {
  return getChainConfig(chainId)?.getRpcUrls();
};

export const getChainLogsRpcUrl = (chainId: DocumentedChainId): string => {
  return getChainConfig(chainId)?.getLogsRpcUrl();
};

export const getChainLogo = (chainId: DocumentedChainId): string | undefined => {
  return getChainConfig(chainId)?.getLogoUrl();
};

export const getChainInfoUrl = (chainId: DocumentedChainId): string | undefined => {
  return getChainConfig(chainId)?.getInfoUrl();
};

export const getChainNativeToken = (chainId: DocumentedChainId): string => {
  return getChainConfig(chainId)?.getNativeToken();
};

export const getCorrespondingMainnetChainId = (chainId: DocumentedChainId): number | undefined => {
  return getChainConfig(chainId)?.getCorrespondingMainnetChainId();
};

export const getChainDeployedContracts = (chainId: DocumentedChainId): DeployedContracts | undefined => {
  return getChainConfig(chainId)?.getDeployedContracts();
};

export const getViemChainConfig = (chainId: DocumentedChainId): ViemChain => {
  return getChainConfig(chainId)?.getViemChainConfig();
};

export const createViemPublicClientForChain = (chainId: DocumentedChainId, url?: string): PublicClient => {
  return getChainConfig(chainId)?.createViemPublicClient(url);
};
