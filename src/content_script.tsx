import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { Identifier } from './constants';
import Browser from 'webextension-polyfill';
import { sendAndAwaitResponseFromPort } from './utils';

const addScript = (url: string) => {
  console.log('adding', url)
  const container = document.head || document.documentElement;
  const scriptTag = document.createElement('script');
  scriptTag.setAttribute('async', 'false');
  scriptTag.setAttribute('src', Browser.runtime.getURL(url));
  container.appendChild(scriptTag);
}

addScript('js/vendor.js');
addScript('js/replace_window_ethereum.js');

// Connect to page
const stream = new WindowPostMessageStream({
  name: Identifier.CONTENT_SCRIPT,
  target: Identifier.INPAGE,
});

// Connect to background script
const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });

stream.on('data', (data) => {
  console.log('CS Received:', data);

  // Forward received messages to background.js
  sendAndAwaitResponseFromPort(extensionPort, data.data)
    .then((response) => {
      console.log(response);
      stream.write({ id: data.id, data: response });
    })
})
