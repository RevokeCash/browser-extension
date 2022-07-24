import { providers } from 'ethers';
import Browser from 'webextension-polyfill';
import { RequestType } from './constants';
import { addressToAppName, decodeApproval, getRpcUrl, getTokenData } from './utils';

// Note that these messages will be periodically cleared due to the background service shutting down
// after 5 minutes of inactivity (see Manifest v3 docs).
const messagePorts: { [index: string]: Browser.Runtime.Port } = {};
const approvedMessages: string[] = [];

const init = async (remotePort: Browser.Runtime.Port) => {
  console.log('connected');
  remotePort.onMessage.addListener((message) => {
    console.log('background received', message);

    if (message.data.type === RequestType.REGULAR) {
      return processRegularRequest(message, remotePort);
    }

    if (message.data.type === RequestType.BYPASS_CHECK) {
      return processBypassCheckRequest(message);
    }
  });
};

Browser.runtime.onConnect.addListener(init);

Browser.runtime.onMessage.addListener((data) => {
  console.log('confirm received', data);
  const responsePort = messagePorts[data.id];
  console.log(responsePort?.name);

  if (data.data) {
    approvedMessages.push(data.id);
  }

  if (responsePort) {
    responsePort.postMessage(data);
    delete messagePorts[data.id];
    return;
  }
});

const processRegularRequest = (message: any, remotePort: Browser.Runtime.Port) => {
  const popupCreated = createPopup(message);

  if (!popupCreated) {
    remotePort.postMessage({ id: message.id, data: true });
    return;
  }

  // Store the remote port so the response can be sent back there
  messagePorts[message.id] = remotePort;
};

const processBypassCheckRequest = (message: any) => {
  const popupCreated = createPopup(message);
  if (!popupCreated) return;
};

const createPopup = (message: any) => {
  console.log(approvedMessages);
  const { transaction, chainId } = message.data;
  const allowance = decodeApproval(transaction.data ?? '', transaction.to ?? '');

  // Return false if we don't create a popup
  if (!allowance) return false;
  if (approvedMessages.includes(message.id)) return false;

  const rpcUrl = getRpcUrl(chainId, '9aa3d95b3bc440fa88ea12eaa4456161');
  Promise.all([
    getTokenData(allowance.asset, new providers.JsonRpcProvider(rpcUrl)),
    addressToAppName(allowance.spender, chainId),
    Browser.windows.getCurrent(),
  ]).then(([tokenData, spenderName, window]) => {
    console.log('spendername', spenderName);
    const queryString = new URLSearchParams({
      id: message.id,
      asset: allowance.asset,
      spender: allowance.spender,
      chainId,
      name: tokenData.name ?? '',
      symbol: tokenData.symbol ?? '',
      spenderName: spenderName ?? '',
      bypassed: message.data.type === RequestType.BYPASS_CHECK ? 'true' : 'false',
    }).toString();

    const width = 440;
    const height = 330;
    const left = Math.round(((window.width ?? width) - width) * 0.5);
    const top = Math.round(((window.height ?? height) - height) * 0.2);

    Browser.windows.create({
      url: `confirm.html?${queryString}`,
      type: 'popup',
      width,
      height,
      left,
      top,
    });
  });

  // Return true after creating the popup
  return true;
};
