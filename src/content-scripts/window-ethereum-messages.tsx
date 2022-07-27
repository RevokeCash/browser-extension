import { WindowPostMessageStream } from '@metamask/post-message-stream';
import Browser from 'webextension-polyfill';
import { Identifier, RequestType } from '../constants';
import { sendAndAwaitResponseFromPort } from '../utils';

// Connect to page
const stream = new WindowPostMessageStream({
  name: Identifier.CONTENT_SCRIPT,
  target: Identifier.INPAGE,
});

stream.on('data', (data) => {
  // Connect to background script
  const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });

  // Forward received messages to background.js
  sendAndAwaitResponseFromPort(extensionPort, { ...data.data, type: RequestType.REGULAR }).then((response) => {
    stream.write({ id: data.id, data: response });
  });
});
