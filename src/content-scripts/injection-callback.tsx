import { WindowPostMessageStream } from '@metamask/post-message-stream';
import Browser from 'webextension-polyfill';
import { Identifier } from '../lib/constants';
import { InjectionCallbackMessage, InPageMessage } from '../lib/types';
import { sendToPortAndAwaitResponse } from '../lib/utils/messages';
import { track } from '../lib/utils/analytics';

// Connect to page
const stream = new WindowPostMessageStream({
  name: Identifier.INJECTION_CALLBACK,
  target: Identifier.INJECTION_INPAGE,
});

let kerberusDetected = false;
let puDetected = false;

console.log('Injection callback stream', stream);

stream.on('data', async (message: InjectionCallbackMessage) => {
  console.log('Injection callback', message);
  track('Injected', message);
});

window.addEventListener('message', (message) => {
  if (message.data?.type?.includes('kerberus') && !kerberusDetected) {
    kerberusDetected = true;
    console.log('Detection: Kerberus detected');
    track('Kerberus detected', {});
  }
});

document.addEventListener('pocket-id-transfer-content-ack', () => {
  if (!puDetected) {
    puDetected = true;
    console.log('Detection: Pocket Universe detected');
    track('Pocket Universe detected', {});
  }
});
