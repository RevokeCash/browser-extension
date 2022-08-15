import { WindowPostMessageStream } from '@metamask/post-message-stream';
import Browser from 'webextension-polyfill';
import { Identifier, LISTING_ALLOWLIST, RequestType } from '../constants';
import { sendAndAwaitResponseFromPort } from '../utils';

// Connect to page
const stream = new WindowPostMessageStream({
  name: Identifier.CONTENT_SCRIPT,
  target: Identifier.INPAGE,
});

stream.on('data', (data) => {
  // Listings are expected to happen on the webistes in the allowlist
  // if (LISTING_ALLOWLIST.includes(location.hostname) && data?.data?.type === RequestType.SIGNATURE) {
  //   stream.write({ id: data.id, data: true });
  //   return;
  // };

  // Connect to background script
  const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });

  // Forward received messages to background.js
  sendAndAwaitResponseFromPort(extensionPort, { type: RequestType.TRANSACTION, ...data.data }).then((response) => {
    stream.write({ id: data.id, data: response });
  });
});
