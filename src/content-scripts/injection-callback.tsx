import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { Identifier } from '../lib/constants';
import { setUserProperty } from '../lib/utils/analytics';

let kerberusDetected = false;
let puDetected = false;
let metamaskDetected = false;
let phantomDetected = false;
let pumpDetected = false;

const stream = new WindowPostMessageStream({
  name: Identifier.INJECTION_CALLBACK,
  target: Identifier.INJECTION_INPAGE,
});

stream.on('data', (data) => {
  if (!phantomDetected && data?.hasPhantom) {
    phantomDetected = true;
    setUserProperty('phantom', true);
  }
});

window.addEventListener('message', (message) => {
  if (!pumpDetected && message.origin.includes('//pump.fun')) {
    pumpDetected = true;
    setUserProperty('pump_fun', true);
  }

  if (
    !metamaskDetected &&
    message.data?.target === 'metamask-contentscript' &&
    message.data?.data?.name === 'metamask-provider'
  ) {
    metamaskDetected = true;
    setUserProperty('metamask', true);
  }

  if (!kerberusDetected && message.data?.type?.includes('kerberus')) {
    kerberusDetected = true;
    setUserProperty('kerberus', true);
  }
});

document.addEventListener('pocket-id-transfer-content-ack', () => {
  if (!puDetected) {
    puDetected = true;
    setUserProperty('pocket_universe', true);
  }
});
