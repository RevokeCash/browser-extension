import { BigNumber } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import { Duplex } from 'readable-stream';
import Browser from 'webextension-polyfill';
import { Signature, SignatureIdentifier } from './constants';

// TODO: Timeout
export const sendAndAwaitResponseFromStream = (stream: Duplex, data: any): Promise<any> => {
  return new Promise((resolve) => {
    const id = Math.random();
    stream.write({ id, data }, console.log);

    const callback = (response: any) => {
      if (response.id === id) {
        resolve(response.data);
        stream.off('data', callback);
      }
    }

    stream.on('data', callback)
  })
}

// TODO: Timeout
export const sendAndAwaitResponseFromPort = (stream: Browser.Runtime.Port, data: any): Promise<any> => {
  return new Promise((resolve) => {
    const id = Math.random();
    stream.postMessage({ id, data });

    const callback = (response: any) => {
      if (response.id === id) {
        resolve(response.data);
        stream.onMessage.removeListener(callback);
      }
    }

    stream.onMessage.addListener(callback);
  })
}

// TODO: provide useful information about the allowances
export const decodeApproval = (data: string, to: string) => {
  if (data.startsWith(SignatureIdentifier.approve)) {
    const decoded = new Interface([`function ${Signature.approve}`]).decodeFunctionData(Signature.approve, data);
    const [spender, approval] = Array.from(decoded);
    if (BigNumber.from(approval).isZero()) return undefined;
    return `You are about to give an allowance to ${spender}`;
  }

  if (data.startsWith(SignatureIdentifier.setApprovalForAll)) {
    const decoded = new Interface([`function ${Signature.setApprovalForAll}`]).decodeFunctionData(Signature.setApprovalForAll, data);
    const [spender, approved] = Array.from(decoded);
    if (!approved) return undefined;
    return `You are about to give an allowance to ${spender}`;
  }

  return undefined;
}
