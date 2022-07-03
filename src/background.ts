import Browser from 'webextension-polyfill';

const messages: { [index: string]: Browser.Runtime.Port } = {};

const init = async (remotePort: Browser.Runtime.Port) => {
  remotePort.onMessage.addListener((data) => {
    console.log('background received', data);

    messages[data.id] = remotePort;

    Browser.windows.create({
      url: `confirm.html?id=${data.id}`,
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
