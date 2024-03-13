import { Address, Hash, Hex, TypedDataDomain } from 'viem';
import { RequestType, WarningType } from './constants';

export interface CommonMessage {
  requestId: Hash;
  data: MessageData;
}

export interface TransactionMessage extends CommonMessage {
  data: TransactionMessageData;
}

export interface TypedSignatureMessage extends CommonMessage {
  data: TypedSignatureMessageData;
}

export interface UntypedSignatureMessage extends CommonMessage {
  data: UntypedSignatureMessageData;
}

export type Message = TransactionMessage | TypedSignatureMessage | UntypedSignatureMessage;

export const isTransactionMessage = (message: Message): message is TransactionMessage => {
  return message.data.type === RequestType.TRANSACTION;
};

export const isTypedSignatureMessage = (message: Message): message is TypedSignatureMessage => {
  return message.data.type === RequestType.TYPED_SIGNATURE;
};

export const isUntypedSignatureMessage = (message: Message): message is TransactionMessage => {
  return message.data.type === RequestType.UNTYPED_SIGNATURE;
};

export interface CommonMessageData {
  type: RequestType;
  hostname: string;
  bypassed?: boolean;
}

export interface TransactionMessageData extends CommonMessageData {
  type: RequestType.TRANSACTION;
  transaction: Transaction;
  chainId: number;
}

export interface TypedSignatureMessageData extends CommonMessageData {
  type: RequestType.TYPED_SIGNATURE;
  typedData: TypedData;
  address: Address;
  chainId: number;
}

export interface UntypedSignatureMessageData extends CommonMessageData {
  type: RequestType.UNTYPED_SIGNATURE;
  message: Hex;
}

export type MessageData = TransactionMessageData | TypedSignatureMessageData | UntypedSignatureMessageData;

export interface MessageResponse {
  requestId: Hash;
  data: boolean;
}

export type InPageMessageData =
  | Omit<TransactionMessageData, 'hostname'>
  | Omit<TypedSignatureMessageData, 'hostname'>
  | Omit<UntypedSignatureMessageData, 'hostname'>;

export interface InPageMessage {
  requestId: Hash;
  data: InPageMessageData;
}

export interface TypedData {
  message?: any;
  domain?: TypedDataDomain;
  primaryType?: string;
}

export interface Transaction {
  from?: Address;
  to?: Address;
  data?: Hex;
  value?: string | bigint;
}

export interface NftListingItem {
  itemType: string;
  token: Address;
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
  requestId: Hash;
  bypassed: boolean;
  hostname: string;
}

export interface AllowanceWarningData extends CommonWarningData {
  type: WarningType.ALLOWANCE;
  chainId: number;
  user: Address;
  assets: Address[];
  spender: Address;
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

export interface SuspectedScamWarningData extends CommonWarningData {
  type: WarningType.SUSPECTED_SCAM;
  address: Address;
  chainId: number;
}

export type WarningData = AllowanceWarningData | ListingWarningData | HashwarningData | SuspectedScamWarningData;

export interface SpenderData {
  name: string;
  exploits?: string[];
}

export interface TokenData {
  name?: string;
  symbol?: string;
  decimals?: bigint;
}
