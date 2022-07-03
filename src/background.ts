import { providers } from 'ethers';
import Browser from 'webextension-polyfill';
import { addressToAppName, decodeApproval, getRpcUrl, getTokenData } from './utils';

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
    ]).then(([tokenData, spenderName]) => {
        console.log('spendername', spenderName);
        const queryString = new URLSearchParams({
          id: data.id,
          asset: allowance.asset,
          spender: allowance.spender,
          chaindId: chainId,
          name: tokenData.name ?? '',
          symbol: tokenData.symbol ?? '',
          spenderName: spenderName ?? '',
        }).toString();

        Browser.windows.create({
          url: `confirm.html?${queryString}`,
          type: 'popup',
          width: 400,
          height: 200,
          left: 0,
          top: 0,
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
