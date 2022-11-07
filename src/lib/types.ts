import { WarningType } from './constants';

export interface NftListingItem {
  itemType: string;
  token: string;
  identifierOrCriteria: string;
  startAmount: string;
  endAmount: string;
}

export interface NftListing {
  offer: NftListingItem[];
  consideration: NftListingItem[];
}

export interface CommonWarningData {
  type: WarningType;
  requestId: string;
  bypassed: boolean;
  hostname: string;
}

export interface AllowanceWarningData extends CommonWarningData {
  type: WarningType.ALLOWANCE;
  chainId: number;
  asset: string;
  spender: string;
}

export interface ListingWarningData extends CommonWarningData {
  type: WarningType.LISTING;
  chainId: number;
  listing: NftListing;
  platform: string;
}

export interface HashwarningData extends CommonWarningData {
  type: WarningType.HASH;
}

export type WarningData = AllowanceWarningData | ListingWarningData | HashwarningData;
