import Browser from 'webextension-polyfill';
import { Identifier, RequestType } from '../lib/constants';
import { sendToPortAndDisregard } from '../lib/utils/messages';

let metamaskChainId = 1;
const bypassed = true;

// TODO: Support bypass checks for other wallets

// Bypass checks for MetaMask
window.addEventListener('message', (message) => {
  const { target } = message?.data ?? {};
  const { name, data } = message?.data?.data ?? {};
  const { hostname } = location;
  const chainId = metamaskChainId;

  if (name !== Identifier.METAMASK_PROVIDER || !data) return;

  const checkMetaMaskBypass = (messageData: any): void => {
    if (!Array.isArray(messageData)) {
      return void checkMetaMaskBypass([messageData]);
    }

    messageData.forEach((item) => {
      if (item.method === 'eth_sendTransaction') {
        const [transaction] = item.params ?? [];
        const type = RequestType.TRANSACTION;

        // Forward received messages to background.js
        const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });
        sendToPortAndDisregard(extensionPort, { type, bypassed, hostname, transaction, chainId });
      } else if (item.method === 'eth_signTypedData_v3' || item.method === 'eth_signTypedData_v4') {
        const [address, typedDataStr] = item.params ?? [];
        const typedData = JSON.parse(typedDataStr);
        const type = RequestType.TYPED_SIGNATURE;

        // Forward received messages to background.js
        const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });
        sendToPortAndDisregard(extensionPort, { type, bypassed, hostname, address, typedData, chainId });
      } else if (item.method === 'eth_sign' || item.method === 'personal_sign') {
        // if the first parameter is the address, the second is the message, otherwise the first is the message
        const [first, second] = item.params ?? [];
        const message = String(first).replace(/0x/, '').length === 40 ? second : first;
        const type = RequestType.UNTYPED_SIGNATURE;

        // Forward received messages to background.js
        const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });
        sendToPortAndDisregard(extensionPort, { type, bypassed, message, hostname });
      }
    });
  };

  if (target === Identifier.METAMASK_CONTENT_SCRIPT) {
    checkMetaMaskBypass(data);
  }

  if (target === Identifier.METAMASK_INPAGE && data?.method?.includes('chainChanged')) {
    metamaskChainId = Number(data?.params?.chainId ?? metamaskChainId);
  }
});

// Bypass checks for Coinbase Wallet
window.addEventListener('message', (message) => {
  const { type, data } = message?.data ?? {};
  const { hostname } = location;

  if (type !== Identifier.COINBASE_WALLET_REQUEST || !data) return;

  if (data.request?.method === 'signEthereumTransaction') {
    const transaction = {
      from: data.request.params.fromAddress,
      to: data.request.params.toAddress,
      data: data.request.params.data,
      value: Number.parseInt(data.request.params.weiValue ?? '0').toString(16),
    };

    const chainId = Number(data.request.params.chainId ?? 1);
    const type = RequestType.TRANSACTION;

    // Forward received messages to background.js
    const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });
    sendToPortAndDisregard(extensionPort, { type, bypassed, hostname, transaction, chainId });
  }

  if (data.request?.method === 'signEthereumMessage') {
    const typedDataStr = data.request.params.typedDataJson;
    const address = data.request.params.address;

    if (typedDataStr) {
      const typedData = JSON.parse(typedDataStr);
      const chainId = Number(typedData?.domain?.chainId ?? 1);
      const type = RequestType.TYPED_SIGNATURE;

      // Forward received messages to background.js
      const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });
      sendToPortAndDisregard(extensionPort, { type, bypassed, hostname, address, typedData, chainId });
    } else {
      const message = data.request.params.message;
      const type = RequestType.UNTYPED_SIGNATURE;

      // Forward received messages to background.js
      const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });
      sendToPortAndDisregard(extensionPort, { type, bypassed, hostname, message });
    }
  }
});
