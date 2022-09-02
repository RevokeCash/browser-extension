import { providers } from 'ethers';
import Browser from 'webextension-polyfill';
import { getLocalStorage } from './lib/background-utils';
import { RequestType } from './lib/constants';
import {
  addressToAppName,
  decodeApproval,
  decodeNftListing,
  decodePermit,
  getOpenSeaItemTokenData,
  getRpcUrl,
  getTokenData,
} from './lib/utils';

// Note that these messages will be periodically cleared due to the background service shutting down
// after 5 minutes of inactivity (see Manifest v3 docs).
const messagePorts: { [index: string]: Browser.Runtime.Port } = {};
const approvedMessages: string[] = [];

const init = async (remotePort: Browser.Runtime.Port) => {
  remotePort.onMessage.addListener((message) => {
    if (message.data.type === RequestType.TRANSACTION) {
      return processTransactionRequest(message, remotePort);
    } else if (message.data.type === RequestType.TRANSACTION_BYPASS_CHECK) {
      return processTransactionBypassCheckRequest(message);
    } else if (message.data.type === RequestType.TYPED_SIGNATURE) {
      return processTypedSignatureRequest(message, remotePort);
    } else if (message.data.type === RequestType.TYPED_SIGNATURE_BYPASS_CHECK) {
      return processTypedSignatureBypassCheckRequest(message);
    } else if (message.data.type === RequestType.UNTYPED_SIGNATURE) {
      return processUntypedSignatureRequest(message, remotePort);
    } else if (message.data.type === RequestType.UNTYPED_SIGNATURE_BYPASS_CHECK) {
      return processUntypedSignatureBypassCheckRequest(message);
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

const processTypedSignatureRequest = async (message: any, remotePort: Browser.Runtime.Port) => {
  const { primaryType } = message?.data?.typedData;

  const popupCreated =
    primaryType === 'Permit' ? await createAllowancePopup(message) : await createNftListingPopup(message);

  if (!popupCreated) {
    remotePort.postMessage({ id: message.id, data: true });
    return;
  }

  // Store the remote port so the response can be sent back there
  messagePorts[message.id] = remotePort;
};

const processTypedSignatureBypassCheckRequest = async (message: any) => {
  const { primaryType } = message?.data?.typedData;

  if (primaryType === 'Permit') {
    await createAllowancePopup(message);
  } else {
    await createNftListingPopup(message);
  }
};

const processUntypedSignatureRequest = async (message: any, remotePort: Browser.Runtime.Port) => {
  const popupCreated = await createHashSignaturePopup(message);

  if (!popupCreated) {
    remotePort.postMessage({ id: message.id, data: true });
    return;
  }

  // Store the remote port so the response can be sent back there
  messagePorts[message.id] = remotePort;
};

const processUntypedSignatureBypassCheckRequest = async (message: any) => {
  createHashSignaturePopup(message);
};

const createAllowancePopup = async (message: any) => {
  const warnOnApproval = await getLocalStorage('settings:warnOnApproval', true);
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
    const bypassed = [RequestType.TRANSACTION_BYPASS_CHECK, RequestType.TYPED_SIGNATURE_BYPASS_CHECK].includes(
      message.data.type
    );

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

const createNftListingPopup = async (message: any) => {
  const warnOnListing = await getLocalStorage('settings:warnOnListing', true);
  if (!warnOnListing) return false;

  const { typedData, chainId } = message.data;
  const { platform, listing } = decodeNftListing(typedData);

  // Return false if we don't create a popup
  if (!listing) return false;
  if (approvedMessages.includes(message.id)) return false;

  const rpcUrl = getRpcUrl(chainId, '9aa3d95b3bc440fa88ea12eaa4456161');
  const provider = new providers.JsonRpcProvider(rpcUrl);
  const offerAssetPromises = listing.offer.map((item: any) => getOpenSeaItemTokenData(item, provider));
  // Display that they're getting 0 ETH if no consideration is included
  const considerationAssetPromises =
    listing.consideration.length > 0
      ? listing.consideration.map((item: any) => getOpenSeaItemTokenData(item, provider))
      : [{ display: '0.0 ETH' }];

  Promise.all([
    Promise.all(offerAssetPromises),
    Promise.all(considerationAssetPromises),
    Browser.windows.getCurrent(),
  ]).then(async ([offerAssets, considerationAssets, window]) => {
    const bypassed = message.data.type === RequestType.TYPED_SIGNATURE_BYPASS_CHECK;

    const queryString = new URLSearchParams({
      id: message.id,
      offerAssets: JSON.stringify(offerAssets),
      considerationAssets: JSON.stringify(considerationAssets),
      platform,
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
};

const createHashSignaturePopup = async (message: any) => {
  const warnOnHashSignatures = await getLocalStorage('settings:warnOnHashSignatures', true);
  if (!warnOnHashSignatures) return false;

  const { message: signMessage } = message.data;

  // If we're not signing a hash, we don't need to popup
  if (String(signMessage).replace(/0x/, '').length !== 64) return false;
  if (approvedMessages.includes(message.id)) return false;

  Promise.all([
    Browser.windows.getCurrent(),
    new Promise((resolve) => setTimeout(resolve, 100)), // Add a slight delay to prevent weird window positioning
  ]).then(async ([window]) => {
    const bypassed = message.data.type === RequestType.UNTYPED_SIGNATURE_BYPASS_CHECK;

    const queryString = new URLSearchParams({
      id: message.id,
      bypassed: bypassed ? 'true' : 'false',
    }).toString();

    const positions = getPopupPositions(window, 0, bypassed);

    const popupWindow = await Browser.windows.create({
      url: `confirm-hash-signature.html?${queryString}`,
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

const getPopupPositions = (window: Browser.Windows.Window, contentLines: number, bypassed: boolean) => {
  const width = 480;
  const height = 320 + contentLines * 24 + (bypassed ? 24 : 0);

  const left = window.left! + Math.round((window.width! - width) * 0.5);
  const top = window.top! + Math.round((window.height! - height) * 0.2);

  return { width, height, left, top };
};
