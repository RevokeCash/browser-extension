import { providers } from 'ethers';
import Browser from 'webextension-polyfill';
import { addressToAppName, decodeApproval, getRpcUrl, getTokenData } from './utils';

// Note that these messages will be cleared due to the background service shutting down
// after 5 minutes of inactivity.
const messages: { [index: string]: Browser.Runtime.Port } = {};

const init = async (remotePort: Browser.Runtime.Port) => {
  remotePort.onMessage.addListener((data) => {
    console.log('background received', data);

    const { transaction, chainId } = data.data;

    const allowance = decodeApproval(transaction.data ?? '', transaction.to ?? '');

    // TODO: Display a popup that it's been checked and is OK
    if (!allowance) {
      remotePort.postMessage({ id: data.id, data: true });
      return;
    }

    messages[data.id] = remotePort;

    const rpcUrl = getRpcUrl(chainId, '9aa3d95b3bc440fa88ea12eaa4456161');
    Promise.all([
      getTokenData(allowance.asset, new providers.JsonRpcProvider(rpcUrl)),
      addressToAppName(allowance.spender, chainId),
      Browser.windows.getCurrent(),
    ]).then(([tokenData, spenderName, window]) => {
        console.log('spendername', spenderName);
        const queryString = new URLSearchParams({
          id: data.id,
          asset: allowance.asset,
          spender: allowance.spender,
          chainId,
          name: tokenData.name ?? '',
          symbol: tokenData.symbol ?? '',
          spenderName: spenderName ?? '',
        }).toString();

        const width = 400;
        const height = 300;
        const left = Math.round(((window.width ?? width) - width) * 0.5);
        const top = Math.round(((window.height ?? height) - height) * 0.2);

        Browser.windows.create({
          url: `confirm.html?${queryString}`,
          type: 'popup',
          width,
          height,
          left,
          top,
        })
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
