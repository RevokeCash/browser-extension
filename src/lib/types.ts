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

export interface AllowanceWarningData {
  asset: string;
  spender: string;
  chainId: number;
  bypassed: boolean;
  hostname: string;
}
