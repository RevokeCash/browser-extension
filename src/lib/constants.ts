export const WHOIS_BASE_URL = 'https://whois.revoke.cash/generated';
export const INFURA_API_KEY = process.env.INFURA_API_KEY!;
export const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY!;
export const HARPIE_API_KEY = process.env.HARPIE_API_KEY!;

export const Urls = {
  REVOKE_CASH: 'https://revoke.cash',
  DISCORD: 'https://discord.gg/revoke-cash',
  TWITTER: 'https://twitter.com/RevokeCash',
  GITHUB: 'https://github.com/RevokeCash/browser-extension',
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
