import { TypedDataDomain } from 'viem';
import { NFT_MARKETPLACES } from '../constants';

// https://learnersbucket.com/examples/javascript/unique-id-generator-in-javascript/
export const randomId = () => {
  let s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  //return id of format aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

export const getMarketplaceName = (domain: TypedDataDomain): string => {
  // Derive the platform from the domain's address or name
  const marketplaceAddress = domain?.verifyingContract?.toLowerCase();
  const platform = NFT_MARKETPLACES[marketplaceAddress ?? ''] ?? domain?.name ?? 'Unknown Marketplace';
  return platform;
};

export const isNullish = (value: unknown): value is null | undefined => {
  return value === null || value === undefined;
};
