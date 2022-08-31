import objectHash from 'object-hash';
import Browser from 'webextension-polyfill';
import { Identifier, LISTING_ALLOWLIST, RequestType } from '../lib/constants';

let chainId = 1;

window.addEventListener('message', (message) => {
  const { target } = message?.data ?? {};
  const { name, data } = message?.data?.data ?? {};

  // TODO: Support bypass checks for other popular wallets

  if (name !== Identifier.METAMASK_PROVIDER || !data) return;

  if (target === Identifier.METAMASK_CONTENT_SCRIPT) {
    if (data.method === 'eth_sendTransaction') {
      const [transaction] = data.params ?? [];
      const type = RequestType.TRANSACTION_BYPASS_CHECK;
      const id = objectHash(transaction);

      // Forward received messages to background.js
      const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });
      extensionPort.postMessage({ id, data: { transaction, chainId, type } });
    } else if (data.method === 'eth_signTypedData_v3' || data.method === 'eth_signTypedData_v4') {
      if (LISTING_ALLOWLIST.includes(location.hostname)) return;

      const [_address, typedDataStr] = data.params ?? [];
      const typedData = JSON.parse(typedDataStr);
      const type = RequestType.TYPED_SIGNATURE_BYPASS_CHECK;
      const id = objectHash(typedData);

      // Forward received messages to background.js
      const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });
      extensionPort.postMessage({ id, data: { typedData, chainId, type } });
    } else if (data.method === 'eth_sign' || data.method === 'personal_sign') {
      if (LISTING_ALLOWLIST.includes(location.hostname)) return;

      // if the first parameter is the address, the second is the message, otherwise the first is the message
      const [first, second] = data.params ?? [];
      const message = String(first).replace(/0x/, '').length === 40 ? second : first;

      const type = RequestType.UNTYPED_SIGNATURE_BYPASS_CHECK;
      const id = objectHash(message);

      // Forward received messages to background.js
      const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });
      extensionPort.postMessage({ id, data: { message, type } });
    }
  }

  if (target === Identifier.METAMASK_INPAGE && data?.method === 'chainChanged') {
    chainId = Number(data?.params?.chainId ?? chainId);
  }
});
