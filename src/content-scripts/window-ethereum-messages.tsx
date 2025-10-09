import { WindowPostMessageStream } from '@metamask/post-message-stream';
import Browser from 'webextension-polyfill';
import { Identifier, RequestType } from '../lib/constants';
import { InPageMessage } from '../lib/types';
import { sendToPortAndAwaitResponse } from '../lib/utils/messages';

// Connect to page
const stream = new WindowPostMessageStream({
  name: Identifier.CONTENT_SCRIPT,
  target: Identifier.INPAGE,
});

stream.on('data', async (message: InPageMessage) => {
  const { hostname } = location;

  if (message?.data?.type === RequestType.GET_FEATURE) {
    const key = message.data.key;
    const res = await Browser.storage.local.get(key);
    const enabled = typeof res?.[key] === 'boolean' ? res[key] : true;

    stream.write({ requestId: message.requestId, data: enabled });
    return;
  }

  // Otherwise: forward to background as before
  const extensionPort = Browser.runtime.connect({ name: Identifier.CONTENT_SCRIPT });
  const response = await sendToPortAndAwaitResponse(extensionPort, { ...message.data, hostname });
  stream.write({ requestId: message.requestId, data: response });
});
