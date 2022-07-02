import Browser from 'webextension-polyfill';

const init = async (remotePort: Browser.Runtime.Port) => {
  remotePort.onMessage.addListener((data) => {
    console.log('background received', data);

    Browser.windows.create({
      url: 'popup.html',
      type: 'popup',
      width: 400,
      height: 200,
      left: 0,
      top: 0,
    })

    remotePort.postMessage({ id: data.id, data: { isOk: true }});
  });
};

Browser.runtime.onConnect.addListener(init);
