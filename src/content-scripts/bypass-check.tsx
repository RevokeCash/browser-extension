import objectHash from 'object-hash';
import Browser from 'webextension-polyfill';
import { Identifier, LISTING_ALLOWLIST, RequestType } from '../constants';

let chainId = 1;

window.addEventListener('message', (message) => {
  const { target } = message?.data ?? {};
  const { name, data } = message?.data?.data ?? {};

  // TODO: Support bypass checks for other popular wallets

  if (name !== Identifier.METAMASK_PROVIDER || !data) return;

  if (target === Identifier.METAMASK_CONTENT_SCRIPT) {
    if (data.method === 'eth_sendTransaction') {
      // Connect to background script
      const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });

      const [transaction] = data.params ?? [];
      const type = RequestType.TRANSACTION_BYPASS_CHECK;
      const id = objectHash(transaction);

      // Forward received messages to background.js
      extensionPort.postMessage({ id, data: { transaction, chainId, type } });
    } else if (data.method === 'eth_signTypedData_v3' || data.method === 'eth_signTypedData_v4') {
      if (LISTING_ALLOWLIST.includes(location.hostname)) return;

      // Connect to background script
      const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });

      const [_address, typedDataStr] = data.params ?? [];
      const typedData = JSON.parse(typedDataStr);
      const type = RequestType.TYPED_SIGNATURE_BYPASS_CHECK;
      const id = objectHash(typedData);

      // Forward received messages to background.js
      extensionPort.postMessage({ id, data: { typedData, chainId, type } });
    }
  }

  if (target === Identifier.METAMASK_INPAGE && data?.method === 'chainChanged') {
    chainId = Number(data?.params?.chainId ?? chainId);
  }
});
