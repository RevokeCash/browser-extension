import objectHash from 'object-hash';
import Browser from 'webextension-polyfill';
import { Identifier, RequestType } from '../lib/constants';

let metamaskChainId = 1;

// TODO: Support bypass checks for other wallets

window.addEventListener('message', (message) => {
  const { target } = message?.data ?? {};
  const { name, data } = message?.data?.data ?? {};
  const { hostname } = location;

  if (name !== Identifier.METAMASK_PROVIDER || !data) return;

  if (target === Identifier.METAMASK_CONTENT_SCRIPT) {
    if (data.method === 'eth_sendTransaction') {
      const [transaction] = data.params ?? [];
      const type = RequestType.TRANSACTION_BYPASS_CHECK;
      const id = objectHash(transaction);

      // Forward received messages to background.js
      const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });
      extensionPort.postMessage({ id, data: { transaction, chainId: metamaskChainId, type, hostname } });
    } else if (data.method === 'eth_signTypedData_v3' || data.method === 'eth_signTypedData_v4') {
      const [_address, typedDataStr] = data.params ?? [];
      const typedData = JSON.parse(typedDataStr);
      const type = RequestType.TYPED_SIGNATURE_BYPASS_CHECK;
      const id = objectHash(typedData);

      // Forward received messages to background.js
      const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });
      extensionPort.postMessage({ id, data: { typedData, chainId: metamaskChainId, type, hostname } });
    } else if (data.method === 'eth_sign' || data.method === 'personal_sign') {
      // if the first parameter is the address, the second is the message, otherwise the first is the message
      const [first, second] = data.params ?? [];
      const message = String(first).replace(/0x/, '').length === 40 ? second : first;

      const type = RequestType.UNTYPED_SIGNATURE_BYPASS_CHECK;
      const id = objectHash(message);

      // Forward received messages to background.js
      const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });
      extensionPort.postMessage({ id, data: { message, type, hostname } });
    }
  }

  if (target === Identifier.METAMASK_INPAGE && data?.method === 'chainChanged') {
    metamaskChainId = Number(data?.params?.chainId ?? metamaskChainId);
  }
});

window.addEventListener('message', (message) => {
  const { type, data } = message?.data ?? {};
  const { hostname } = location;

  if (type !== Identifier.COINBASE_WALLET_REQUEST || !data) return;

  if (data.request?.method === 'signEthereumTransaction') {
    const transaction = {
      from: data.request.params.fromAddress,
      to: data.request.params.toAddress,
      data: data.request.params.data,
    };

    const chainId = Number(data.request.params.chainId ?? 1);
    const type = RequestType.TRANSACTION_BYPASS_CHECK;
    const id = objectHash(transaction);

    // Forward received messages to background.js
    const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });
    extensionPort.postMessage({ id, data: { transaction, chainId, type, hostname } });
  }

  if (data.request?.method === 'signEthereumMessage') {
    const typedDataStr = data.request.params.typedDataJson;

    if (typedDataStr) {
      const typedData = JSON.parse(typedDataStr);
      const chainId = Number(typedData?.domain?.chainId ?? 1);
      const type = RequestType.TYPED_SIGNATURE_BYPASS_CHECK;
      const id = objectHash(typedData);

      // Forward received messages to background.js
      const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });
      extensionPort.postMessage({ id, data: { typedData, chainId, type, hostname } });
    } else {
      const message = data.request.params.message;
      const type = RequestType.UNTYPED_SIGNATURE_BYPASS_CHECK;
      const id = objectHash(message);

      // Forward received messages to background.js
      const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });
      extensionPort.postMessage({ id, data: { message, type, hostname } });
    }
  }
});
