import Browser from 'webextension-polyfill';
import { decodeApproval } from './utils';

const messages: { [index: string]: Browser.Runtime.Port } = {};

const init = async (remotePort: Browser.Runtime.Port) => {
  remotePort.onMessage.addListener((data) => {
    console.log('background received', data);

    const [transaction] = data?.data?.params ?? [];

    const allowanceMessage = decodeApproval(transaction?.data ?? '', transaction?.to ?? '');

    // TODO: Display a popup that it's been checked and is OK
    if (!allowanceMessage) {
      remotePort.postMessage({ id: data.id, data: true });
      return;
    }

    messages[data.id] = remotePort;

    Browser.windows.create({
      url: `confirm.html?id=${data.id}&message=${allowanceMessage}`,
      type: 'popup',
      width: 400,
      height: 200,
      left: 0,
      top: 0,
    })
  });
};

Browser.runtime.onConnect.addListener(init);

Browser.runtime.onMessage.addListener((data) => {
  console.log('confirm received', data);
  const responsePort = messages[data.id];
  console.log(responsePort?.name);
  if (responsePort) {
    responsePort.postMessage(data);
    delete messages[data.id];
    return;
  }
})
