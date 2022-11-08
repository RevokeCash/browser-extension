import { WindowPostMessageStream } from '@metamask/post-message-stream';
import Browser from 'webextension-polyfill';
import { Identifier } from '../lib/constants';
import { InPageMessage } from '../lib/types';
import { sendToPortAndAwaitResponse } from '../lib/utils/messages';

// Connect to page
const stream = new WindowPostMessageStream({
  name: Identifier.CONTENT_SCRIPT,
  target: Identifier.INPAGE,
});

stream.on('data', (message: InPageMessage) => {
  // Connect to background script
  const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });

  // Forward received messages to background.js
  const { hostname } = location;
  sendToPortAndAwaitResponse(extensionPort, { ...message.data, hostname }).then((response) => {
    stream.write({ requestId: message.requestId, data: response });
  });
});
