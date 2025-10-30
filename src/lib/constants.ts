export const WHOIS_BASE_URL = 'https://whois.revoke.cash/generated';
export const FEE_RECIPIENT = process.env.FEE_RECIPIENT;
export const CHAINPATROL_API_KEY = process.env.CHAINPATROL_API_KEY;
export const TENDERLY_ACCOUNT = process.env.TENDERLY_ACCOUNT;
export const TENDERLY_PROJECT = process.env.TENDERLY_PROJECT;
export const TENDERLY_ACCESS_KEY = process.env.TENDERLY_ACCESS_KEY;

export const ENABLE_LOG_SIMULATIONS = false;

export const Urls = {
  REVOKE_CASH: 'https://revoke.cash',
  DISCORD: 'https://discord.gg/revoke-cash',
  X: 'https://x.com/RevokeCash',
  GITHUB: 'https://github.com/RevokeCash/browser-extension',
  KERBERUS: 'https://www.kerberus.com/extension/?ref=REVOKECASH',
} as const;

export const Identifier = {
  INPAGE: 'revoke-inpage',
  CONTENT_SCRIPT: 'revoke-contentscript',
  CONFIRM: 'revoke-confirm',
  METAMASK_INPAGE: 'metamask-inpage',
  METAMASK_CONTENT_SCRIPT: 'metamask-contentscript',
  METAMASK_PROVIDER: 'metamask-provider',
  COINBASE_WALLET_REQUEST: 'extensionUIRequest',
} as const;

export const SignatureIdentifier = {
  approve: '0x095ea7b3',
  permit2Approve: '0x87517c45',
  increaseAllowance: '0x39509351',
  setApprovalForAll: '0xa22cb465',
} as const;

export const potentialScamSignatures = [
  '0x5fba79f5', // SecurityUpdate()
  '0xaf347b61', // securityUpdate()
  '0x79372f9a', // ClaimReward() (e.g. https://etherscan.io/address/0xA9193a6E406Ec0C715ce985f619263cb0f717B79#code)
  '0xb88a802f', // claimReward()
  '0x12798972', // ClaimRewards() (e.g. https://etherscan.io/address/0x10f9ec4181988b83d36a9df8ec87a73a3e27e4ac#code)
  '0x372500ab', // claimRewards()
  '0x3158952e', // Claim() (e.g. https://etherscan.io/address/0x0f56CcEB1A2dC1a598bb14d7121525dB2C05a7c5#code)
  '0x4e71d92d', // claim() (e.g. https://etherscan.io/address/0x08915b57db78c0ff7e26b241820eede4b1badf2f#code)
  '0xf472eedf', // SafeClaim()
  '0x2526350f', // safeClaim()
  '0xb9a9d3d0', // ClaimAirdrop()
  '0x5b88349d', // claimAirdrop()
  '0x9c9316c5', // NetworkMerge() (e.g. https://etherscan.io/address/0x00000f312c54d0dd25888ee9cdc3dee988700000#code)
  '0xa06adfa8', // networkMerge()
  '0x143087ee', // Verify() (e.g. https://zkevm.polygonscan.com/address/0x00002cc5a5a9b61dc29203e428979b66c3880000)
  '0xfc735e99', // verify() (e.g. https://etherscan.io/address/0x7073ee7074be8d156cbb886ed3cebe2d2d4703ae)
  // --- also: confirm(), connect(), start(), gift(), enable()
];

export const Signature = {
  approve: 'approve(address,uint256)',
  permit2Approve: 'approve(address,address,uint160,uint48)',
  increaseAllowance: 'increaseAllowance(address,uint256)',
  increaseApproval: 'increaseApproval(address,uint256)',
  setApprovalForAll: 'setApprovalForAll(address,bool)',
} as const;

export const Address = {
  ZERO: '0x0000000000000000000000000000000000000000',
} as const;

export enum RequestType {
  TRANSACTION = 'transaction',
  TYPED_SIGNATURE = 'typed-signature',
  UNTYPED_SIGNATURE = 'untyped-signature',
  GET_FEATURE = 'GET_FEATURE',
}

export enum WarningType {
  ALLOWANCE = 'allowance',
  LISTING = 'listing',
  HASH = 'hash',
  SUSPECTED_SCAM = 'suspected_scam',
}

export const OpenSeaItemType = {
  ETHER: '0',
  ERC20: '1',
  ERC721: '2',
  ERC1155: '3',
  ERC721_CRITERIA: '4',
  ERC1155_CRITERIA: '5',
  UNKNOWN: '-1',
} as const;

export const PlaceHolderItem = {
  UNKNOWN: {
    itemType: OpenSeaItemType.UNKNOWN,
    token: Address.ZERO,
    identifierOrCriteria: 'unknown',
    startAmount: 'unknown',
    endAmount: 'unknown',
  },
  ZERO_ETH: {
    itemType: OpenSeaItemType.ETHER,
    token: Address.ZERO,
    identifierOrCriteria: '',
    startAmount: '0',
    endAmount: '0',
  },
} as const;

export const HostnameAllowList: Record<WarningType, string[]> = {
  [WarningType.ALLOWANCE]: [],
  [WarningType.LISTING]: ['opensea.io', 'pro.opensea.io', 'app.uniswap.org', 'blur.io', 'looksrare.org', 'x2y2.io'],
  [WarningType.HASH]: [
    'opensea.io',
    'pro.opensea.io',
    'app.uniswap.org',
    'blur.io',
    'looksrare.org',
    'x2y2.io',
    'unstoppabledomains.com',
  ],
  [WarningType.SUSPECTED_SCAM]: [],
};

export const AddressAllowList: Record<WarningType, string[]> = {
  [WarningType.ALLOWANCE]: [],
  [WarningType.LISTING]: [],
  [WarningType.HASH]: [],
  [WarningType.SUSPECTED_SCAM]: [
    '0x1eb7bcab5edf75b5e02c9a72d3287e322ebaefdb', // tevaera.com -> claim() | zkSync
    '0xd0c155595929fd6be034c3848c00daebc6d330f6', // omni.network -> claim() | ETH
    '0x61a58cba8e715bfe1b93cfa1695c14979a6006d2', // unvest.io -> claim() | ETH
    '0xae2b459e55c5391e807830549f4ca7965b81ac55', // unvest.io -> claim() | Base
  ],
};

export const NFT_MARKETPLACES: Record<string, string> = {
  '0x00000000006c3852cbef3e08e8df289169ede581': 'OpenSea',
  '0x00000000000001ad428e4906ae43d8f9852d0dd6': 'OpenSea',
  '0x59728544b08ab483533076417fbbb2fd0b17ce3a': 'LooksRare',
  '0x000000000000ad05ccc4f10045630fb830b95127': 'Blur',
  '0x2445a4e934af7c786755931610af099554ba1354': 'UneMeta',
};

export const warningSettingKeys: Record<WarningType, string> = {
  [WarningType.ALLOWANCE]: 'settings:warnOnApproval',
  [WarningType.LISTING]: 'settings:warnOnListing',
  [WarningType.HASH]: 'settings:warnOnHashSignatures',
  [WarningType.SUSPECTED_SCAM]: 'settings:warnOnSuspectedScams',
};

// -------- execute(...) selectors --------
export const EXECUTE2_SELECTOR = '0x24856bc3'; // execute(bytes, bytes[])
export const EXECUTE3_SELECTOR = '0x3593564c'; // execute(bytes, bytes[], uint256)

// -------- DEX router allowlist by chain (UR only here)
export const ROUTERS_BY_CHAIN: Record<number, string[]> = {
  // === Ethereum (1)
  1: [
    // Uniswap Universal Router (v1)
    '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
    // Uniswap Universal Router (v4 / UR2)
    '0x66a9893cc07d91d95644aedd05d03f95e1dba8af',
    // PancakeSwap Smart Router (ETH)
    '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4',
    // PancakeSwap v3 Universal Router (ETH)
    '0x65b382653f7C31bC0Af67f188122035461ec9C76',
  ].map((a) => a.toLowerCase()),

  // === BNB Chain (56)
  56: [
    // Uniswap v4 Universal Router (labelled on BscScan)
    '0x1906c1d672b88cd1b9ac7593301ca990f94eae07',
    // PancakeSwap Infinity Universal Router
    '0xd9C500DfF816a1Da21A48A732d3498Bf09dc9AEB',
    // PancakeSwap Smart Router (v3)
    '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4',
    // PancakeSwap v3 Universal Router (BSC)
    '0x1A0A18AC4BECDDbd6389559687d1A73d8927E416',
  ].map((a) => a.toLowerCase()),

  // === Arbitrum One (42161)
  42161: [
    // Uniswap Universal Router (v1)
    '0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5',
    // PancakeSwap Smart Router
    '0x32226588378236Fd0c7c4053999F88aC0e5cAc77',
    // PancakeSwap v3 Universal Router
    '0xFE6508f0015C778Bdcc1fB5465bA5ebE224C9912',
  ].map((a) => a.toLowerCase()),

  // === Optimism (10)
  10: [
    // Uniswap Universal Router (v4 / UR2)
    '0x851116d9223fabed8e56c0e6b8ad0c31d98b3507',
  ].map((a) => a.toLowerCase()),

  // === Base (8453)
  8453: [
    // Uniswap Universal Router (v4 / UR2)
    '0x6fF5693B99212Da76AD316178A184aB56D299B43',
    // PancakeSwap Smart Router
    '0x678Aa4bF4E210cf2166753e054d5b7c31cc7fa86',
    // PancakeSwap Infinity Universal Router
    '0xd9C500DfF816a1Da21A48A732d3498Bf09dc9AEB',
    // PancakeSwap v3 Universal Router
    '0xFE6508f0015C778Bdcc1fB5465bA5ebE224C9912',
  ].map((a) => a.toLowerCase()),

  // === Linea (59144)
  59144: [
    // PancakeSwap Smart Router
    '0x678Aa4bF4E210cf2166753e054d5b7c31cc7fa86',
    // PancakeSwap v3 Universal Router
    '0xFE6508f0015C778Bdcc1fB5465bA5ebE224C9912',
  ].map((a) => a.toLowerCase()),

  // === Polygon zkEVM (1101)
  1101: [
    // PancakeSwap Smart Router
    '0x678Aa4bF4E210cf2166753e054d5b7c31cc7fa86',
    // PancakeSwap v3 Universal Router
    '0xB89a6778D1efE7a5b7096757A21b810CC2886fa1',
  ].map((a) => a.toLowerCase()),

  // === zkSync Era (324)
  324: [
    // PancakeSwap Smart Router
    '0xf8b59f3c3Ab33200ec80a8A58b2aA5F5D2a8944C',
    // PancakeSwap v3 Universal Router
    '0xdAee41E335322C85ff2c5a6745c98e1351806e98',
  ].map((a) => a.toLowerCase()),
};

// -------- Universal Router command bytes (Uniswap-UR compatible) --------
export const CMD = {
  V3_SWAP_EXACT_IN: '00',
  V3_SWAP_EXACT_OUT: '01',
  PERMIT2_TRANSFER_FROM: '02',
  PERMIT2_PERMIT_BATCH: '03',
  SWEEP: '04',
  TRANSFER: '05',
  PAY_PORTION: '06',
  V2_SWAP_EXACT_IN: '08',
  V2_SWAP_EXACT_OUT: '09',
  PERMIT2_PERMIT: '0a',
  WRAP_ETH: '0b',
  UNWRAP_WETH: '0c',
  PERMIT2_TRANSFER_FROM_BATCH: '0d',
  BALANCE_CHECK_ERC20: '0e',
  V4_SWAP: '10',
  EXECUTE_SUB_PLAN: '21',
} as const;

export const WRAPPED_NATIVE: Record<number, string> = {
  1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH (ETH)
  56: '0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB (BNB Chain)
};

// -------- Defaults / settings --------
export const DEFAULT_FEE_BPS = 100; // 1%

// Behavior flags
export const STRICT_GAS_ONLY_SEND_IF_ESTIMATE_OK = true;
export const GAS_BUMP_NUMERATOR = 12n; // +20%
export const GAS_BUMP_DENOM = 10n;

// Pseudo owners used by UR for balance checks
export const MSG_SENDER = '0x0000000000000000000000000000000000000001';
export const ADDRESS_THIS = '0x0000000000000000000000000000000000000002';

export const CHROME_EXTENSION_URL =
  'https://chrome.google.com/webstore/detail/revokecash/nmniboccheadcclilkfkonokbcoceced';
export const FIREFOX_EXTENSION_URL = 'https://addons.mozilla.org/en-US/firefox/addon/revoke-cash/';
export const DISCORD_URL = 'https://discord.gg/revoke-cash';
export const GITHUB_URL = 'https://github.com/RevokeCash/revoke.cash';
export const X_URL = 'https://x.com/RevokeCash';

export const ADDRESS_ZERO_PADDED = '0x0000000000000000000000000000000000000000000000000000000000000000' as const;
export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000' as const;
export const DUMMY_ADDRESS_PADDED = '0x0000000000000000000000000000000000000000000000000000000000000001' as const;
export const DUMMY_ADDRESS = '0x0000000000000000000000000000000000000001' as const;
export const DUMMY_ADDRESS_2 = '0x0000000000000000000000000000000000000002' as const;
export const OPENSEA_REGISTRY_ADDRESS = '0xa5409ec958C83C3f309868babACA7c86DCB077c1' as const;
export const MOONBIRDS_ADDRESS = '0x23581767a106ae21c074b2276D25e5C3e136a68b' as const;
export const DONATION_ADDRESS = '0xfcBf17200C64E860F6639aa12B525015d115F863' as const; // revokecash.eth
export const MULTICALL_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11' as const;

export const UNSTOPPABLE_DOMAINS_ETH_ADDRESS = '0x578853aa776Eef10CeE6c4dd2B5862bdcE767A8B' as const;
export const UNSTOPPABLE_DOMAINS_POLYGON_ADDRESS = '0x91EDd8708062bd4233f4Dd0FCE15A7cb4d500091' as const;
export const AVVY_DOMAINS_ADDRESS = '0x1ea4e7A798557001b99D88D6b4ba7F7fc79406A9' as const;

export const ETHERSCAN_API_KEYS = JSON.parse(process.env.ETHERSCAN_API_KEYS ?? '{}');
export const ETHERSCAN_RATE_LIMITS = JSON.parse(process.env.ETHERSCAN_RATE_LIMITS ?? '{}');

export const RPC_OVERRIDES = JSON.parse(process.env.NEXT_PUBLIC_NODE_URLS ?? '{}');
export const ALCHEMY_API_KEY = 'cg75iYASPCd863Tfp1cLX';
export const INFURA_API_KEY = '503630b922e14449829250ad32364f21';
export const DRPC_API_KEY = process.env.DRPC_API_KEY ?? process.env.NEXT_PUBLIC_DRPC_API_KEY;
export const WEBACY_API_KEY = process.env.WEBACY_API_KEY ?? process.env.NEXT_PUBLIC_WEBACY_API_KEY;
export const NEFTURE_API_KEY = process.env.NEFTURE_API_KEY ?? process.env.NEXT_PUBLIC_NEFTURE_API_KEY;
export const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY ?? process.env.NEXT_PUBLIC_RESERVOIR_API_KEY;
export const FAIRSIDE_API_KEY = process.env.FAIRSIDE_API_KEY ?? process.env.NEXT_PUBLIC_FAIRSIDE_API_KEY;
export const KERBERUS_API_KEY = process.env.KERBERUS_API_KEY ?? process.env.NEXT_PUBLIC_KERBERUS_API_KEY;

export const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY ?? process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
export const COINGECKO_API_BASE_URL = 'https://pro-api.coingecko.com/api/v3';
export const FEATURE_KEYS = {
  SIMULATOR: 'feature_simulator_enabled',
  GOOGLE_AD_WARN: 'feature_google_ad_warn_enabled',
  COINGECKO_AD_WARN: 'feature_coingecko_ad_warn_enabled',
  DEXTOOLS_AD_WARN: 'feature_dextools_ad_warn_enabled',
  DEXSCREENER_AD_WARN: 'feature_dexscreener_ad_warn_enabled',
  X_OP_DETECTOR: 'feature_x_op_detector_enabled',
  ETHOS_SCORE: 'feature_ethos_score_enabled',
  ADDRESS_GUARD: 'feature_address_guard_enabled',
  COVERAGE: 'feature_coverage_enabled',
  SLOWMODE: 'feature_slowmode_enabled',
} as const;

export type FeatureKey = (typeof FEATURE_KEYS)[keyof typeof FEATURE_KEYS];

export const FEATURE_DEFAULTS: Record<FeatureKey, boolean> = {
  [FEATURE_KEYS.SIMULATOR]: true,
  [FEATURE_KEYS.GOOGLE_AD_WARN]: true,
  [FEATURE_KEYS.COINGECKO_AD_WARN]: true,
  [FEATURE_KEYS.DEXTOOLS_AD_WARN]: true,
  [FEATURE_KEYS.DEXSCREENER_AD_WARN]: true,
  [FEATURE_KEYS.X_OP_DETECTOR]: true,
  [FEATURE_KEYS.ETHOS_SCORE]: true,
  [FEATURE_KEYS.ADDRESS_GUARD]: true,
  [FEATURE_KEYS.COVERAGE]: true,
  [FEATURE_KEYS.SLOWMODE]: false,
};
