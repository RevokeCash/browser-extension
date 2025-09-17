import { ethers } from 'ethers';

export const bytesList = (cmdHex: string) => (cmdHex.slice(2).match(/.{1,2}/g) || []).map((b) => b.toLowerCase());

export const enc = (types: string[], values: any[]) => ethers.utils.defaultAbiCoder.encode(types, values);

export const to32 = (bn: ethers.BigNumber | string | bigint) => {
  const h = ethers.BigNumber.from(bn).toHexString().replace(/^0x/, '');
  return h.length >= 64 ? h.slice(-64) : '0'.repeat(64 - h.length) + h;
};

export const padAddr = (a: string) =>
  '0'.repeat(24) + String(a).replace(/^0x/, '').toLowerCase().padStart(40, '0').slice(-40);
