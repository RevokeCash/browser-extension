import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { Identifier, RequestType } from '../constants';
import Browser from 'webextension-polyfill';
import { sendAndAwaitResponseFromPort } from '../utils';

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
