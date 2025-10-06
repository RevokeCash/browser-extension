import { setUserProperty } from '../lib/utils/analytics';

let kerberusDetected = false;
let puDetected = false;

window.addEventListener('message', (message) => {
  if (message.data?.type?.includes('kerberus') && !kerberusDetected) {
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
