import { providers } from 'ethers';
import Browser from 'webextension-polyfill';
import { RequestType } from './constants';
import { addressToAppName, decodeApproval, decodeOpenSeaListing, decodePermit, getOpenSeaItemTokenData, getRpcUrl, getTokenData } from './utils';

// Note that these messages will be periodically cleared due to the background service shutting down
// after 5 minutes of inactivity (see Manifest v3 docs).
const messagePorts: { [index: string]: Browser.Runtime.Port } = {};
const approvedMessages: string[] = [];

const init = async (remotePort: Browser.Runtime.Port) => {
  remotePort.onMessage.addListener((message) => {
    if (message.data.type === RequestType.TRANSACTION) {
      return processTransactionRequest(message, remotePort);
    }

    if (message.data.type === RequestType.TRANSACTION_BYPASS_CHECK) {
      return processTransactionBypassCheckRequest(message);
    }

    if (message.data.type === RequestType.SIGNATURE) {
      return processSignatureRequest(message, remotePort);
    }

    if (message.data.type === RequestType.SIGNATURE_BYPASS_CHECK) {
      return processSignatureBypassCheckRequest(message);
    }
  });
};

Browser.runtime.onConnect.addListener(init);

Browser.runtime.onMessage.addListener((data) => {
  const responsePort = messagePorts[data.id];

  if (data.data) {
    approvedMessages.push(data.id);
  }

  if (responsePort) {
    responsePort.postMessage(data);
    delete messagePorts[data.id];
    return;
  }
});

const processTransactionRequest = async (message: any, remotePort: Browser.Runtime.Port) => {
  const popupCreated = await createAllowancePopup(message);

  if (!popupCreated) {
    remotePort.postMessage({ id: message.id, data: true });
    return;
  }

  // Store the remote port so the response can be sent back there
  messagePorts[message.id] = remotePort;
};

const processTransactionBypassCheckRequest = (message: any) => {
  createAllowancePopup(message);
};


const processSignatureRequest = async (message: any, remotePort: Browser.Runtime.Port) => {
  const { primaryType } = message?.data?.typedData;

  const popupCreated = primaryType === 'Permit'
    ? await createAllowancePopup(message)
    : await createOpenSeaListingPopup(message);

  if (!popupCreated) {
    remotePort.postMessage({ id: message.id, data: true });
    return;
  }

  // Store the remote port so the response can be sent back there
  messagePorts[message.id] = remotePort;
}

const processSignatureBypassCheckRequest = async (message: any) => {
  const { primaryType } = message?.data?.typedData;

  if (primaryType === 'Permit') {
    await createAllowancePopup(message)
  } else {
    await createOpenSeaListingPopup(message);
  }
}

const createAllowancePopup = async (message: any) => {
  const { ['settings:warnOnApproval']: warnOnApproval } = await Browser.storage.local.get({ 'settings:warnOnApproval': true });
  if (!warnOnApproval) return false;

  const { transaction, typedData, chainId } = message.data;
  const allowance = transaction
    ? decodeApproval(transaction.data ?? '', transaction.to ?? '')
    : decodePermit(typedData);

  // Return false if we don't create a popup
  if (!allowance) return false;
  if (approvedMessages.includes(message.id)) return false;

  const rpcUrl = getRpcUrl(chainId, '9aa3d95b3bc440fa88ea12eaa4456161');
  const provider = new providers.JsonRpcProvider(rpcUrl);

  Promise.all([
    getTokenData(allowance.asset, provider),
    addressToAppName(allowance.spender, chainId),
    Browser.windows.getCurrent(),
  ]).then(async ([tokenData, spenderName, window]) => {
    const bypassed = [RequestType.TRANSACTION_BYPASS_CHECK, RequestType.SIGNATURE_BYPASS_CHECK].includes(message.data.type);

    const queryString = new URLSearchParams({
      id: message.id,
      asset: allowance.asset,
      spender: allowance.spender,
      chainId,
      name: tokenData.name ?? '',
      symbol: tokenData.symbol ?? '',
      spenderName: spenderName ?? '',
      bypassed: bypassed ? 'true' : 'false',
    }).toString();

    const positions = getPopupPositions(window, 2, bypassed);

    const popupWindow = await Browser.windows.create({
      url: `confirm-allowance.html?${queryString}`,
      type: 'popup',
      ...positions,
    });

    // Specifying window position does not work on Firefox, so we have to reposition after creation (6 y/o bug -_-).
    // Has no effect on Chrome, because the window position is already correct.
    await Browser.windows.update(popupWindow.id!, positions);
  });

  // Return true after creating the popup
  return true;
};


const createOpenSeaListingPopup = async (message: any) => {
  const { ['settings:warnOnListing']: warnOnListing } = await Browser.storage.local.get({ 'settings:warnOnListing': true });
  if (!warnOnListing) return false;

  const { typedData, chainId } = message.data;
  const openSeaListing = decodeOpenSeaListing(typedData);

  // Return false if we don't create a popup
  if (!openSeaListing) return false;
  if (approvedMessages.includes(message.id)) return false;

  const rpcUrl = getRpcUrl(chainId, '9aa3d95b3bc440fa88ea12eaa4456161');
  const provider = new providers.JsonRpcProvider(rpcUrl);
  const offerAssetPromises = openSeaListing.offer.map((item: any) => getOpenSeaItemTokenData(item, provider));
  // Display that they're getting 0 ETH if no consideration is included
  const considerationAssetPromises = openSeaListing.consideration.length > 0
    ? openSeaListing.consideration.map((item: any) => getOpenSeaItemTokenData(item, provider))
    : [{ display: '0.0 ETH' }]

  Promise.all([
    Promise.all(offerAssetPromises),
    Promise.all(considerationAssetPromises),
    Browser.windows.getCurrent(),
  ]).then(async ([offerAssets, considerationAssets, window]) => {
    const bypassed = message.data.type === RequestType.SIGNATURE_BYPASS_CHECK;

    const queryString = new URLSearchParams({
      id: message.id,
      offerAssets: JSON.stringify(offerAssets),
      considerationAssets: JSON.stringify(considerationAssets),
      platform: 'OpenSea',
      chainId,
      bypassed: bypassed ? 'true' : 'false',
    }).toString();

    const positions = getPopupPositions(window, offerAssets.length + considerationAssets.length, bypassed);

    const popupWindow = await Browser.windows.create({
      url: `confirm-listing.html?${queryString}`,
      type: 'popup',
      ...positions,
    });

    // Specifying window position does not work on Firefox, so we have to reposition after creation (6 y/o bug -_-).
    // Has no effect on Chrome, because the window position is already correct.
    await Browser.windows.update(popupWindow.id!, positions);
  });

  // Return true after creating the popup
  return true;
}

const getPopupPositions = (window: Browser.Windows.Window, contentLines: number, bypassed: boolean) => {
  const width = 480;
  const height = 320 + contentLines * 20 + (bypassed ? 20 : 0);

  const left = window.left! + Math.round((window.width! - width) * 0.5);
  const top = window.top! + Math.round((window.height! - height) * 0.2);

  return { width, height, left, top };
}
