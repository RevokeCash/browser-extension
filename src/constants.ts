export const Identifier = {
  INPAGE: 'revoke-inpage',
  CONTENT_SCRIPT: 'revoke-contentscript',
  CONFIRM: 'revoke-confirm',
  METAMASK_INPAGE: 'metamask-inpage',
  METAMASK_CONTENT_SCRIPT: 'metamask-contentscript',
  METAMASK_PROVIDER: 'metamask-provider',
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
}

export const RequestType = {
  TRANSACTION: 'transaction',
  SIGNATURE: 'signature',
  TRANSACTION_BYPASS_CHECK: 'transaction-bypass-check',
  SIGNATURE_BYPASS_CHECK: 'signature-bypass-check',
};

export const OpenSeaItemType = {
  ETHER: '0',
  ERC20: '1',
  ERC721: '2',
  ERC1155: '3',
  ERC721_CRITERIA: '4',
  ERC1155_CRITERIA: '5',
}

export const LISTING_ALLOWLIST = [
  'opensea.io',
  'www.genie.xyz',
  'www.gem.xyz',
  'looksrare.org',
]
