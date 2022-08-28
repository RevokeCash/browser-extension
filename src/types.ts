export interface NftListingItem {
  itemType: string;
  token: string;
  identifierOrCriteria: string;
  startAmount: string;
  endAmount: string;
}

export interface NftListing {
  offerer: string;
  offer: NftListingItem[];
  consideration: NftListingItem[];
}
