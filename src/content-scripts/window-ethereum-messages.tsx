import { WindowPostMessageStream } from '@metamask/post-message-stream';
import Browser from 'webextension-polyfill';
import { Identifier, RequestType } from '../lib/constants';
import { sendAndAwaitResponseFromPort } from '../lib/utils/messages';

// Connect to page
const stream = new WindowPostMessageStream({
  name: Identifier.CONTENT_SCRIPT,
  target: Identifier.INPAGE,
});

stream.on('data', (data) => {
  // Connect to background script
  const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });

  // Forward received messages to background.js
  const { hostname } = location;
  sendAndAwaitResponseFromPort(extensionPort, { type: RequestType.TRANSACTION, hostname, ...data.data }).then(
    (response) => {
      stream.write({ id: data.id, data: response });
    }
  );
});
