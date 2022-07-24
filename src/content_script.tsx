import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { Identifier, RequestType } from './constants';
import Browser from 'webextension-polyfill';
import { sendAndAwaitResponseFromPort } from './utils';
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
    const type = RequestType.DOUBLE_CHECK;

    // Connect to background script
    const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });

    // Forward received messages to background.js
    const id = objectHash(transaction);
    extensionPort.postMessage({ id, data: { transaction, chainId, type } });
    // sendAndAwaitResponseFromPort(extensionPort, { transaction, chainId, type: RequestType.DOUBLE_CHECK })
  }

  if (target === Identifier.METAMASK_INPAGE && data?.method === 'chainChanged') {
    chainId = Number(data?.params?.chainId ?? chainId);
  }

  // if (message?.data?.target?.includes('metamask')) {
  //   console.warn(message?.data?.data?.name, message?.data?.target, message?.data?.data?.data)
  // }
})

const addScript = (url: string) => {
  console.log('adding', url)
  const container = document.head || document.documentElement;
  const scriptTag = document.createElement('script');
  scriptTag.setAttribute('async', 'false');
  scriptTag.setAttribute('src', Browser.runtime.getURL(url));
  container.appendChild(scriptTag);
}

addScript('js/vendor.js');
addScript('js/proxy_window_ethereum.js');

// Connect to page
const stream = new WindowPostMessageStream({
  name: Identifier.CONTENT_SCRIPT,
  target: Identifier.INPAGE,
});


stream.on('data', (data) => {
  console.log('CS Received:', data);

  // Connect to background script
  const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });

  // Forward received messages to background.js
  sendAndAwaitResponseFromPort(extensionPort, { ...data.data, type: RequestType.REGULAR })
    .then((response) => {
      console.log(response);
      stream.write({ id: data.id, data: response });
    })
})
