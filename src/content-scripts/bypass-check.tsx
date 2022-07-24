import { Identifier, RequestType } from '../constants';
import Browser from 'webextension-polyfill';
import objectHash from 'object-hash';

// Keep track of chainId
let chainId = 1;

window.addEventListener('message', (message) => {
  const { target } = message?.data ?? {};
  const { name, data } = message?.data?.data ?? {};

  console.log(target, name, data)

  if (name !== Identifier.METAMASK_PROVIDER) return;

  if (target === Identifier.METAMASK_CONTENT_SCRIPT && data?.method === 'eth_sendTransaction') {
    const [transaction] = data?.params ?? [];
    const type = RequestType.BYPASS_CHECK;

    // Connect to background script
    const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });

    // Forward received messages to background.js
    const id = objectHash(transaction);
    extensionPort.postMessage({ id, data: { transaction, chainId, type } });
  }

  if (target === Identifier.METAMASK_INPAGE && data?.method === 'chainChanged') {
    chainId = Number(data?.params?.chainId ?? chainId);
  }
})
