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

export const Signature = {
  approve: 'approve(address,uint256)',
  increaseAllowance: 'increaseAllowance(address,uint256)',
  setApprovalForAll: 'setApprovalForAll(address,bool)',
};

export const Address = {
  ZERO: '0x0000000000000000000000000000000000000000',
};

export const RequestType = {
  TRANSACTION: 'transaction',
  TYPED_SIGNATURE: 'typed-signature',
  UNTYPED_SIGNATURE: 'untyped-signature',
  TRANSACTION_BYPASS_CHECK: 'transaction-bypass-check',
  TYPED_SIGNATURE_BYPASS_CHECK: 'typed-signature-bypass-check',
  UNTYPED_SIGNATURE_BYPASS_CHECK: 'untyped-signature-bypass-check',
};

export enum WarningType {
  ALLOWANCE = 'allowance',
  LISTING = 'listing',
  HASH = 'hash',
}

export const BYPASS_TYPES = [
  RequestType.TRANSACTION_BYPASS_CHECK,
  RequestType.TYPED_SIGNATURE_BYPASS_CHECK,
  RequestType.UNTYPED_SIGNATURE_BYPASS_CHECK,
];

export const OpenSeaItemType = {
  ETHER: '0',
  ERC20: '1',
  ERC721: '2',
  ERC1155: '3',
  ERC721_CRITERIA: '4',
  ERC1155_CRITERIA: '5',
  UNKNOWN: '-1',
};

export const UNKNOWN_OPENSEA_ITEM = {
  itemType: OpenSeaItemType.UNKNOWN,
  token: 'unknown',
  identifierOrCriteria: 'unknown',
  startAmount: 'unknown',
  endAmount: 'unknown',
};

export const AllowList = {
  ALLOWANCE: [] as string[],
  NFT_LISTING: ['opensea.io', 'www.genie.xyz', 'www.gem.xyz', 'looksrare.org', 'x2y2.io', 'blur.io'],
  HASH_SIGNATURE: ['opensea.io', 'www.genie.xyz', 'www.gem.xyz', 'looksrare.org', 'x2y2.io', 'unstoppabledomains.com'],
};

export const NFT_MARKETPLACES: { [address: string]: string } = {
  '0x00000000006c3852cbef3e08e8df289169ede581': 'OpenSea',
  '0x59728544b08ab483533076417fbbb2fd0b17ce3a': 'LooksRare',
  '0x000000000000ad05ccc4f10045630fb830b95127': 'Blur',
  '0x2445a4e934af7c786755931610af099554ba1354': 'UneMeta',
};
