export const Urls = {
  REVOKE_CASH: 'https://revoke.cash',
  DISCORD: 'https://discord.gg/revoke-cash',
  TWITTER: 'https://twitter.com/RevokeCash',
  GITHUB: 'https://github.com/RevokeCash/browser-extension',
};

export const Identifier = {
  INPAGE: 'revoke-inpage',
  CONTENT_SCRIPT: 'revoke-contentscript',
  CONFIRM: 'revoke-confirm',
  METAMASK_INPAGE: 'metamask-inpage',
  METAMASK_CONTENT_SCRIPT: 'metamask-contentscript',
  METAMASK_PROVIDER: 'metamask-provider',
  COINBASE_WALLET_REQUEST: 'extensionUIRequest',
};

export const SignatureIdentifier = {
  approve: '0x095ea7b3',
  increaseAllowance: '0x39509351',
  setApprovalForAll: '0xa22cb465',
};

export const ScamSignatureIdentifier = {
  SecurityUpdate: '0x5fba79f5',
};

export const Signature = {
  approve: 'approve(address,uint256)',
  increaseAllowance: 'increaseAllowance(address,uint256)',
  setApprovalForAll: 'setApprovalForAll(address,bool)',
};

export const Address = {
  ZERO: '0x0000000000000000000000000000000000000000',
};

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
};

export const PlaceHolderItem = {
  UNKNOWN: {
    itemType: OpenSeaItemType.UNKNOWN,
    token: 'unknown',
    identifierOrCriteria: 'unknown',
    startAmount: 'unknown',
    endAmount: 'unknown',
  },
  ZERO_ETH: {
    itemType: OpenSeaItemType.ETHER,
    token: '',
    identifierOrCriteria: '',
    startAmount: '0',
    endAmount: '0',
  },
};

export const AllowList: Record<WarningType, string[]> = {
  [WarningType.ALLOWANCE]: [],
  [WarningType.LISTING]: ['opensea.io', 'www.genie.xyz', 'www.gem.xyz', 'looksrare.org', 'x2y2.io', 'blur.io'],
  [WarningType.HASH]: [
    'opensea.io',
    'www.genie.xyz',
    'www.gem.xyz',
    'looksrare.org',
    'x2y2.io',
    'unstoppabledomains.com',
  ],
  [WarningType.SUSPECTED_SCAM]: [],
};

export const NFT_MARKETPLACES: Record<string, string> = {
  '0x00000000006c3852cbef3e08e8df289169ede581': 'OpenSea',
  '0x00000000000001ad428e4906ae43d8f9852d0dd6': 'OpenSea',
  '0x59728544b08ab483533076417fbbb2fd0b17ce3a': 'LooksRare',
  '0x000000000000ad05ccc4f10045630fb830b95127': 'Blur',
  '0x2445a4e934af7c786755931610af099554ba1354': 'UneMeta',
};

export const INFURA_API_KEY = process.env.INFURA_API_KEY;

export const warningSettingKeys: Record<WarningType, string> = {
  [WarningType.ALLOWANCE]: 'settings:warnOnApproval',
  [WarningType.LISTING]: 'settings:warnOnListing',
  [WarningType.HASH]: 'settings:warnOnHashSignatures',
  [WarningType.SUSPECTED_SCAM]: 'settings:warnOnSuspectedScams',
};
