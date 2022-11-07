import { BigNumber } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import {
  Address,
  NFT_MARKETPLACES,
  OpenSeaItemType,
  PlaceHolderItem,
  Signature,
  SignatureIdentifier,
  WarningType,
} from '../constants';
import { NftListing, WarningData } from '../types';

export const decodeApproval = (transaction: any) => {
  if (!transaction || !transaction.data || !transaction.to || !transaction.from) return undefined;

  const { data, from: user, to: asset } = transaction;

  if (data.startsWith(SignatureIdentifier.approve)) {
    const iface = new Interface([`function ${Signature.approve}`]);
    const decoded = iface.decodeFunctionData(Signature.approve, data);
    const [spender, approval] = Array.from(decoded);
    if (BigNumber.from(approval).isZero() || spender === Address.ZERO) return undefined;
    return { user, asset, spender };
  }

  if (data.startsWith(SignatureIdentifier.increaseAllowance)) {
    const iface = new Interface([`function ${Signature.increaseAllowance}`]);
    const decoded = iface.decodeFunctionData(Signature.increaseAllowance, data);
    const [spender, approval] = Array.from(decoded);
    if (BigNumber.from(approval).isZero()) return undefined;
    return { user, asset, spender };
  }

  if (data.startsWith(SignatureIdentifier.setApprovalForAll)) {
    const iface = new Interface([`function ${Signature.setApprovalForAll}`]);
    const decoded = iface.decodeFunctionData(Signature.setApprovalForAll, data);
    const [spender, approved] = Array.from(decoded);
    if (!approved) return undefined;
    return { user, asset, spender };
  }

  return undefined;
};

export const decodePermit = (typedData: any) => {
  if (!typedData || !typedData.domain?.verifyingContract || !typedData.message) return undefined;
  if (typedData.primaryType !== 'Permit') return undefined;

  const asset = typedData.domain.verifyingContract;
  const { spender, value, allowed, holder, owner } = typedData.message;
  const user = owner ?? holder;

  if (value === '0' || allowed === false) return undefined;

  return { user, asset, spender };
};

// TODO: Check contracts and update platforms accordingly

export const decodeNftListing = (data: any) => {
  const listing = decodeOpenSeaListing(data) || decodeLooksRareListing(data) || decodeBlurListing(data);

  // Derive the platform from the domain's address or name
  const platform = NFT_MARKETPLACES[data?.domain?.verifyingContract?.toLowerCase()] ?? data?.domain?.name;

  return { platform, listing };
};

export const decodeOpenSeaListing = (data: any): NftListing | undefined => {
  const { offer, offerer } = data?.message ?? {};
  if (!offer || !offerer) return undefined;

  const consideration = (data?.message?.consideration ?? []).filter((item: any) => item.recipient === offerer);

  return { offer, consideration };
};

export const decodeLooksRareListing = (data: any): NftListing | undefined => {
  if (data?.primaryType !== 'MakerOrder') return undefined;

  const { signer, collection, tokenId, amount, price, currency, minPercentageToAsk } = data?.message ?? {};

  if (!signer || !collection || !tokenId || !amount || !price || !currency || !minPercentageToAsk) return undefined;

  const receiveAmount = ((BigInt(price) * BigInt(minPercentageToAsk)) / BigInt(10_000)).toString();

  // Normalise LooksRare listing format to match OpenSea's

  const offer = [
    {
      itemType: OpenSeaItemType.ERC1155, // Assume ERC1155 since that also works for ERC721
      token: collection,
      identifierOrCriteria: tokenId,
      startAmount: amount,
      endAmount: amount,
    },
  ];

  const consideration = [
    {
      itemType: OpenSeaItemType.ERC20,
      token: currency,
      identifierOrCriteria: '0',
      startAmount: receiveAmount,
      endAmount: receiveAmount,
      recipient: signer,
    },
  ];

  return { offer, consideration };
};

const decodeBlurListing = (data: any): NftListing | undefined => {
  // Blur bulk listings (Root type) are undecodable -_-
  if (data?.primaryType === 'Root') {
    return { offer: [PlaceHolderItem.UNKNOWN], consideration: [PlaceHolderItem.UNKNOWN] };
  }

  if (data?.primaryType !== 'Order') return undefined;

  const { trader, collection, tokenId, amount, paymentToken, price, fees } = data?.message ?? {};

  if (!trader || !collection || !tokenId || !amount || !paymentToken || !price || !fees) return undefined;

  const totalFeeRate = fees.reduce((total: bigint, fee: any) => BigInt(fee.rate) + total, BigInt(0));
  const minPercentageToAsk = BigInt(10_000) - totalFeeRate;
  const receiveAmount = ((BigInt(price) * BigInt(minPercentageToAsk)) / BigInt(10_000)).toString();

  // Normalise Blur listing format to match OpenSea's

  const offer = [
    {
      itemType: OpenSeaItemType.ERC1155, // Assume ERC1155 since that also works for ERC721
      token: collection,
      identifierOrCriteria: tokenId,
      startAmount: amount,
      endAmount: amount,
    },
  ];

  const consideration = [
    {
      itemType: paymentToken === Address.ZERO ? OpenSeaItemType.ETHER : OpenSeaItemType.ERC20,
      token: paymentToken,
      identifierOrCriteria: '0',
      startAmount: receiveAmount,
      endAmount: receiveAmount,
      recipient: trader,
    },
  ];

  return { offer, consideration };
};

export const decodeWarningData = (params: URLSearchParams): WarningData | undefined => {
  const type = params.get('type');
  const requestId = params.get('requestId');
  const hostname = params.get('hostname');
  const bypassed = params.get('bypassed') === 'true';
  const chainId = Number(params.get('chainId'));
  const platform = params.get('platform');
  const asset = params.get('asset');
  const spender = params.get('spender');

  let listing;
  try {
    listing = JSON.parse(params.get('listing') || '');
  } catch {}

  if (!type || !requestId || !hostname) return undefined;

  if (type === WarningType.ALLOWANCE) {
    if (!chainId || !asset || !spender) return undefined;
    return { type, requestId, bypassed, hostname, chainId, asset, spender };
  } else if (type === WarningType.LISTING) {
    if (!chainId || !listing || !platform) return undefined;
    return { type, requestId, bypassed, hostname, chainId, listing, platform };
  } else if (type === WarningType.HASH) {
    return { type, requestId, bypassed, hostname };
  }

  return undefined;
};
