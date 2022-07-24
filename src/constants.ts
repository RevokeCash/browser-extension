export const Identifier = {
  INPAGE: 'revoke-inpage',
  CONTENT_SCRIPT: 'revoke-contentscript',
  CONFIRM: 'revoke-confirm',
  METAMASK_INPAGE: 'metamask-inpage',
  METAMASK_CONTENT_SCRIPT: 'metamask-contentscript',
  METAMASK_PROVIDER: 'metamask-provider',
}

export const SignatureIdentifier = {
  approve: '0x095ea7b3',
  setApprovalForAll: '0xa22cb465',
}

export const Signature = {
  approve: 'approve(address,uint256)',
  setApprovalForAll: '	setApprovalForAll(address,bool)',
}

export const RequestType = {
  REGULAR: 'regular',
  BYPASS_CHECK: 'bypass-check',
}
