import objectHash from 'object-hash';
import Browser from 'webextension-polyfill';
import { Identifier, RequestType } from '../constants';

let chainId = 1;

window.addEventListener('message', (message) => {
  const { target } = message?.data ?? {};
  const { name, data } = message?.data?.data ?? {};

  console.log(target, name, data);

  // TODO: Support bypass checks for other popular wallets

  if (name !== Identifier.METAMASK_PROVIDER) return;

  if (target === Identifier.METAMASK_CONTENT_SCRIPT && data?.method === 'eth_sendTransaction') {
    // Connect to background script
    const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });

    const [transaction] = data?.params ?? [];
    const type = RequestType.BYPASS_CHECK;
    const id = objectHash(transaction);

    // Forward received messages to background.js
    extensionPort.postMessage({ id, data: { transaction, chainId, type } });
  }

  if (target === Identifier.METAMASK_INPAGE && data?.method === 'chainChanged') {
    chainId = Number(data?.params?.chainId ?? chainId);
  }
});
